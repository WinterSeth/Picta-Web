import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { BehaviorSubject, catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { UserModel } from '../modules/picta/models/user.model';
import { NotificationService } from './notification.service';
import { Credentials, CredentialsService } from '../modules/picta/services/credentials.service';
import { CommentNotificationComponent } from '../modules/picta/pages/medias/components/publicacion/comment-notification/comment-notification.component';
import { MatSnackBar } from '@angular/material/snack-bar';
/* import { connect, StringCodec } from 'nats.ws';
 */import { environment } from '../../environments/environment';
import { BrowserNotificationService } from './browser-notification.service';
import { NotificationStoreService } from '../modules/picta/services/notification-store.service';
import { LocalstorageService } from './localstorage.service';
import { ActivePerfilService } from './active-perfil.service';

export interface IslaplayUser {
  username: string;
  tokenType?: string;
}

export interface IslaplayAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private notificationStore = inject(NotificationStoreService);
  private ws: WebSocket;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 segundos
  private userCode: string;
  private heartbeatInterval: any;
  private heartbeatTimer: any;
  user: UserModel;
  sseSubscribed = false;
  private paymentSource = new BehaviorSubject<any>(null);
  payment$ = this.paymentSource.asObservable();
  private userSource = new BehaviorSubject<UserModel>(null);
  user$ = this.userSource.asObservable();
  private notificationSource = new BehaviorSubject<any>(null);
  notifications$ = this.notificationSource.asObservable();

  public refrehing: boolean = false;

  // Islaplay authentication properties
  private readonly ISLAPLAY_CLIENT_ID = 'ebkU3YeFu3So9hesQHrS8AZjEa4v7TiYbS5QZIgO';
  
  private islaplayTokenSubject = new BehaviorSubject<string | null>(null);
  public islaplayToken$ = this.islaplayTokenSubject.asObservable();
  
  private islaplayUserSubject = new BehaviorSubject<IslaplayUser | null>(null);
  public islaplayUser$ = this.islaplayUserSubject.asObservable();
  
  private isIslaplayRefreshing = false;
  private islaplayRefreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private httpCli: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private credentialsService: CredentialsService,
    private matsnackBar: MatSnackBar,
    private browserNotificationService: BrowserNotificationService,
    private localstorage: LocalstorageService,
    private activePerfilService: ActivePerfilService,
  ) {
    // Initialize Islaplay subjects with stored values after DI is complete
    const token = this.getIslaplayToken();
    const user = this.getIslaplayUser();
    this.islaplayTokenSubject.next(token);
    this.islaplayUserSubject.next(user);

    this.credentialsService.credentials &&
      this.credentialsService.credentials.user &&
      this.setUserData(this.credentialsService.credentials.user);
  }

  get userData() {
    return (
      this.credentialsService.credentials &&
      this.credentialsService.credentials.user
    );
  }

  login(loginData) {
    const body = new FormData();
    body.append('grant_type', 'password');
    body.append('client_id', environment.clientId);
    if (isNaN(loginData.value.username)) {
      if (loginData.value.username.startsWith('+53')) {
        body.append('username', loginData.value.username.slice(4));
      } else {
        body.append('username', loginData.value.username);
      }
    } else {
      body.append('username', loginData.value.code + loginData.value.username);
    }

    body.append('password', loginData.value.password);

    // Request with observe: 'response' to get headers including X-Device-Id
    return this.httpCli.post(`${environment.baseUrl}/o/token/`, body, { observe: 'response' }).pipe(
      tap((response: HttpResponse<any>) => {
        // Save device ID from response headers if available
        const deviceId = response.headers.get('X-Device-Id');
        if (deviceId?.trim()) {
          this.localstorage.setDeviceId(deviceId.trim());
        }
      })
    );
  }

  getUserName() {
    if(this.credentialsService.credentials){
      return this.credentialsService.credentials.user.username
    }
    return null ;
  }

  setUserData(user) {
    if (user) {
      this.subscribeToNats(user.code);
    }
    this.userSource.next(user);
  }

  register(registerForm) {
    const newUser = new FormData();
    newUser.append('username', registerForm.username);

    registerForm.phone_number && newUser.append('phone_number', registerForm.phone_number);

    registerForm.with_mail && newUser.append('with_mail', registerForm.with_mail);

    registerForm.with_mail && newUser.append('email', registerForm.email);

    newUser.append('fecha_nacimiento', registerForm.fecha_nacimiento);

    newUser.append('password', registerForm.password);

    registerForm.phone_number && newUser.append('country_code', '+53');

    return this.httpCli.post(`${environment.baseUrl}/v1/usuario/`, newUser);
  }

  get_username(username) {
    return this.httpCli.get(`${environment.baseUrl}/v1/usuario/${username}/generar_username`);
  }

  isLoggedIn() {
    return this.credentialsService.isAuthenticated();
  }

  getToken() {
    if (this.isLoggedIn()) {
      return this.credentialsService.credentials.access_token;
    }
    return null
  }

  logout() {
    this.credentialsService.setCredentials();
    this.userSource.next(null);
    // Clear active profile
    this.activePerfilService.clearActiveProfile();
    // Clear device ID
    this.localstorage.clearDeviceId();
    try {
      localStorage.removeItem('active-profile');
    } catch (e) {
      console.warn('Could not remove active-profile from localStorage', e);
    }
    this.router.navigate(['/inicio']);
  }

  /**
   * Force logout with a specific reason, redirecting to login page
   * @param reason - The reason for forced logout (e.g., 'device_required')
   * @param extras - Optional navigation extras
   */
  forceLogoutWithReason(reason: string, extras?: NavigationExtras): void {
    this.credentialsService.setCredentials();
    this.userSource.next(null);
    this.activePerfilService.clearActiveProfile();
    this.localstorage.clearDeviceId();
    
    try {
      localStorage.removeItem('active-profile');
    } catch (e) {
      console.warn('Could not remove active-profile from localStorage', e);
    }

    const navigationExtras: NavigationExtras = {
      ...extras,
      queryParams: { ...extras?.queryParams, reason }
    };
    
    this.router.navigate(['/usuario/acceder'], navigationExtras);
  }

  getUserData(): Observable<any> {
    return this.httpCli.get(`${environment.baseUrl}/v2/usuario/me/`);
  }

/*   async subscribeToNatsWebSocketOk(userCode: string) {
    const ws = new WebSocket('wss://natio.picta.cu/notification');
  
    // Configura para recibir datos binarios si es necesario
    ws.binaryType = 'arraybuffer';
  
    ws.onopen = () => {
      console.log('Conexión establecida');
      this.sseSubscribed = true;
      
      // Envía comando NATS para suscribirse (formato protocolo NATS)
      const subscribeMsg = `SUB ${userCode} 1\r\n`;
      ws.send(subscribeMsg);
    };
  
    ws.onmessage = (event) => {
      try {
        // Paso 1: Decodificar el mensaje crudo
        const rawMsg = this.decodeMessage(event.data);
        
        // Paso 2: Extraer el payload NATS
        const payload = this.extractNatsPayload(rawMsg);
        if (!payload) return;
  
        // Paso 3: Parsear el JSON interno
        const data = JSON.parse(payload);
        
        if (data.identificador === 'publicacion_nueva') {
          this.notificationService.openNotification(
            `${data.data.nombre_canal} ha publicado un nuevo video: ${data.data.nombre_publicacion}.`,
            data.data.slug_url
          );
        } else if (data.identificador === 'publicacion_convertida') {
          this.notificationService.openNotification(
            `El video ${data.data.nombre_publicacion} se ha convertido.`,
            data.data.slug_url
          );
        } else if (data.tipo === 'notificacion_api') {
          this.getUserData().subscribe((res: any) => {
            this.setUserData(res);
          });
          this.notificationService.open('notification', `${data.data.msg}`);
        } else if (data.tipo === 'notificacion_issue_report') {
          const interactionId = data.data?.interaction_id || '';
          const text = interactionId 
            ? `Su reporte #${interactionId} ha sido respondido por un webmaster`
            : 'Un reporte ha sido respondido por un webmaster';
          this.notificationService.open('notification', text, { label: 'Ver', url: '/ayuda-soporte' });
        } else if (data.tipo === 'notificacion_pago') {
          this.paymentSource.next(data);
          this.getUserData().subscribe((res: any) => {
            this.setUserData(res);
          });
        } else if (data.identificador === 'respuesta_comentario') {
          this.matsnackBar.openFromComponent(CommentNotificationComponent, {
            data: data.data,
          });
        }
        // Emitir el evento para que otros componentes (ej. header) lo reciban
        this.notificationSource.next(data);
        this.notificationSource.next(data);
  
      } catch (err) {
        console.warn('Mensaje no procesado:', event.data, err);
      }
    };
  
    // Manejo de errores
    this.ws.onerror = (error) => console.error('❌ WebSocket error:', error);
    this.ws.onclose = () => {
      console.log('🔌 WebSocket desconectado');
      this.sseSubscribed = false;
    };
  } */

  async subscribeToNats(userCode: string) {
    this.userCode = userCode;
    this.connectWebSocket();
  }

  private connectWebSocket() {
    // Cierra conexión existente si hay una
    if (this.ws) {
      this.ws.close();
    }
  
    this.ws = new WebSocket('wss://natio.picta.cu/notification');
    this.ws.binaryType = 'arraybuffer';
  
    // 1. Evento de conexión abierta
    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.sseSubscribed = true;

      // Within onopen:
      this.heartbeatInterval = setInterval(() => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send('PING\r\n');
        }
      }, 30000); // Cada 30 segundos
      
      // Envía comando de suscripción NATS
      const subscribeMsg = `SUB ${this.userCode} 1\r\n`;
      this.ws.send(subscribeMsg);
    };
  
// 2. Evento de mensaje recibido
    this.ws.onmessage = (event) => {
      try {
        const rawMsg = this.decodeMessage(event.data);
        const payload = this.extractNatsPayload(rawMsg);
        if (!payload) {
          if (rawMsg && rawMsg.includes('PING')) {
            this.ws.send('PONG\r\n');
          }
          return;
        }
        
        const data = JSON.parse(payload);
        if (data.identificador === 'publicacion_nueva') {
          this.notificationService.openNotification(
            `${data.data.nombre_canal} ha publicado un nuevo video: ${data.data.nombre_publicacion}.`,
            data.data.slug_url
          );
        } else if (data.identificador === 'publicacion_convertida') {
          this.notificationService.openNotification(
            `El video ${data.data.nombre_publicacion} se ha convertido.`,
            data.data.slug_url
          );
        } else if (data.tipo === 'notificacion_api') {
          this.getUserData().subscribe((res: any) => {
            this.setUserData(res);
          });
          this.notificationService.open('notification', `${data.data.msg}`);
} else if (data.tipo === 'notificacion_issue_report') {
          const text = 'Su reporte ha sido respondido por un administrador';
          this.notificationService.open('notification', text, { label: 'Ver', url: '/ayuda-soporte' });
          this.notificationStore.incrementBadge();
        }
         
        // Siempre emitir al observable para actualizar badge
        this.notificationSource.next(data);
        
      } catch (err) {
        // Silent error
      }
    };

// 3. Evento de error
    this.ws.onerror = () => {};

    // 4. Evento de cierre
    this.ws.onclose = () => {
      this.sseSubscribed = false;

      // Dentro de onclose:
      clearInterval(this.heartbeatInterval);
      
      // Reconexión automática con retardo exponencial
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = this.reconnectDelay * (this.reconnectAttempts + 1);
        
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connectWebSocket();
        }, delay);
      } else {
        console.error('❌ Máximo de reconexiones alcanzado');
      }
    };
  }
  
  // Métodos auxiliares
  private decodeMessage(data: any): string {
    if (typeof data === 'string') return data;
    if (data instanceof ArrayBuffer) {
      return new TextDecoder().decode(data);
    }
    return '';
  }
  
  private extractNatsPayload(rawMsg: string): string | null {
    const lines = rawMsg.split('\r\n');
    if (lines.length < 2) return null;
    
    if (lines[0].startsWith('MSG ')) {
      return lines[1];
    }
    return null;
  }

/*   async subscribeToNatsNew(userCode: string) {
    try {
      // 1. Conexión directa al servidor NATS WebSocket
      const nc = await connect({
        servers: 'wss://natio.picta.cu/notification', // Asegúrate que el puerto WS esté abierto
        reconnect: true // Habilita reconexión automática
      });
  
      // 2. Suscripción al canal del usuario
      const sub = nc.subscribe(userCode);
      const sc = StringCodec();
      this.sseSubscribed = true;
  
      // 3. Escucha de mensajes (tu lógica original)
      (async () => {
        for await (const msg of sub) {
          const data = JSON.parse(sc.decode(msg.data));
          
          if (data.identificador === 'publicacion_nueva') {
            this.notificationService.openNotification(
              `${data.data.nombre_canal} ha publicado un nuevo video: ${data.data.nombre_publicacion}.`,
              data.data.slug_url
            );
          } else if (data.identificador === 'publicacion_convertida') {
            this.notificationService.openNotification(
              `El video ${data.data.nombre_publicacion} se ha convertido.`,
              data.data.slug_url
            );
} else if (data.tipo === 'notificacion_api') {
          this.getUserData().subscribe((res: any) => {
            this.setUserData(res);
          });
          this.notificationService.open('notification', `${data.data.msg}`);
        } else if (data.tipo === 'notificacion_issue_report') {
          const interactionId2 = data.data?.interaction_id || '';
          const text2 = interactionId2 
            ? `Su reporte #${interactionId2} ha sido respondido por un webmaster`
            : 'Un reporte ha sido respondido por un webmaster';
          this.notificationService.open('notification', text2, { label: 'Ver', url: '/ayuda-soporte' });
          this.notificationStore.incrementBadge();
        } else if (data.tipo === 'notificacion_pago') {
            this.paymentSource.next(data);
            this.notificationStore.incrementBadge();
            this.getUserData().subscribe((res: any) => {
              this.setUserData(res);
            });
} else if (data.identificador === 'respuesta_comentario') {
            this.matsnackBar.openFromComponent(CommentNotificationComponent, {
              data: data.data,
            });
          } else {
            console.log('📨 ℹ️ Notificación tipo no manejado:', data.identificador);
          }
          
          // 🔔 EMITIR SIEMPRE al observable para que el header actualice el badge
          console.log('📭 ✅ 🔔🔔🔔 Emitiendo a notificationSource:', data);
          this.notificationSource.next(data);
          
          // También actualizar el badge directamente en el store
          console.log('📭 🔔🔔 Actualizando badge directamente...');
          this.notificationStore.incrementBadge(); // Incrementar inmediatamente
          this.notificationStore.load(true); // Recargar después
  
          this.notificationSource.next(data);
        }
      })();
  
      // 4. Manejo de cierre (opcional)
      nc.closed()
        .then(() => this.sseSubscribed = false)
        .catch(err => console.error('Error en conexión NATS:', err));
  
    } catch (err) {
      console.error('Error al conectar a NATS:', err);
    }
  } */

/*   async subscribeToNatsOld(userCode: string) {
    const sc = StringCodec();
    const connection = await connect({
      servers: 'wss://natio.picta.cu/notification',
    });
    const subscription: any = connection.subscribe(userCode);
    this.sseSubscribed = true;
    await (async () => {
      for await (const message of subscription) {
        const data = JSON.parse(sc.decode(message.data));
        if (data.identificador === 'publicacion_nueva') {
          this.notificationService.openNotification(
            `${data.data.nombre_canal} ha publicado un nuevo video: ${data.data.nombre_publicacion}.`,
            data.data.slug_url
          );
        } else if (data.identificador === 'publicacion_convertida') {
          this.notificationService.openNotification(
            `El video ${data.data.nombre_publicacion} se ha convertido.`,
            data.data.slug_url
          );
        } else if (data.tipo === 'notificacion_api') {
          this.getUserData().subscribe((res: any) => {
            this.setUserData(res);
          });
          this.notificationService.open('notification', `${data.data.msg}`);
        } else if (data.tipo === 'notificacion_issue_report') {
          const interactionId = data.data?.interaction_id || '';
          const text = interactionId 
            ? `Su reporte #${interactionId} ha sido respondido por un webmaster`
            : 'Un reporte ha sido respondido por un webmaster';
          this.notificationService.open('notification', text, { label: 'Ver', url: '/ayuda-soporte' });
        } else if (data.tipo === 'notificacion_pago') {
          this.paymentSource.next(data);
          this.getUserData().subscribe((res: any) => {
            this.setUserData(res);
          });
        } else if (data.identificador === 'respuesta_comentario') {
          this.matsnackBar.openFromComponent(CommentNotificationComponent, {
            data: data.data,
          });
        }
        this.notificationSource.next(data);
      }
    })();
  } */

  setNotifications(value) {
    this.notificationSource.next(value);
  }

  refreshToken(): Observable<any> {
    const body = new FormData();
    body.append('grant_type', 'refresh_token');
    body.append('client_id', environment.clientId);
    body.append('refresh_token', this.credentialsService.credentials.refresh_token);
    
    return this.httpCli.post(environment.authUrl, body).pipe(
      tap(data => {
        if(data){
          this.setToken(data);
        } else {
          this.logout();
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  setToken(data) {
    this.credentialsService.setCredentials({ ...this.credentialsService.credentials, access_token: data.access_token, refresh_token: data.refresh_token});

    this.setUserData(this.credentialsService.credentials.user);

    /* // this.setUserData(this.credentialsService.credentials);
     this.getUserData().subscribe((user: any) => {
       this.credentialsService.setCredentials({user, ...this.credentialsService.credentials});
       this.setUserData(user);
       // location.reload();
     });*/
  }

  verifySmsCode(code) {
    const codeBody = new FormData();
    codeBody.append('token', code);
    codeBody.append('client_id', environment.clientId);
    return this.httpCli.post(`${environment.baseUrl}/v1/usuario/sms_verify/`, codeBody);
  }

  changeToken() {
    this.credentialsService.setCredentials({...this.credentialsService.credentials, access_token: 'asd'});
  }

  // ============================================
  // Islaplay Authentication Methods
  // ============================================

  /**
   * Login to Islaplay API
   * Stores credentials in the same format as Picta login
   * After getting the token, fetches user data from /user/me
   */
  loginIslaplay(username: string, password: string): Observable<IslaplayAuthResponse> {
    const formData = new FormData();
    formData.append('grant_type', 'password');
    formData.append('client_id', this.ISLAPLAY_CLIENT_ID);
    formData.append('username', username);
    formData.append('password', password);

    return this.httpCli.post<IslaplayAuthResponse>('https://api.picta.cu/o/token/', formData).pipe(
      switchMap(response => {
        // Temporarily store tokens to make authenticated request
        const tempCredentials: Credentials = {
          user: { username: username },
          access_token: response.access_token,
          refresh_token: response.refresh_token || ''
        };
        this.credentialsService.setCredentials(tempCredentials);
        
        // Fetch full user data from /user/me
        return this.httpCli.get<any>('https://api.picta.cu/v2/usuario/me/').pipe(
          tap(userData => {
            // Store complete credentials with full user data
            const credentials: Credentials = {
              user: userData,
              access_token: response.access_token,
              refresh_token: response.refresh_token || ''
            };
            
            this.credentialsService.setCredentials(credentials);
            
            this.islaplayTokenSubject.next(response.access_token);
            this.islaplayUserSubject.next({ username: userData.username || username, tokenType: response.token_type });
          }),
          switchMap(() => new Observable<IslaplayAuthResponse>(observer => {
            observer.next(response);
            observer.complete();
          }))
        );
      }),
      catchError(error => {
        console.error('Islaplay login error:', error);
        this.logoutIslaplay();
        return throwError(() => new Error(error?.error?.error_description || 'Login failed'));
      })
    );
  }

  /**
   * Refresh Islaplay access token
   */
  refreshIslaplayToken(): Observable<IslaplayAuthResponse> {
    const currentCredentials = this.credentialsService.credentials;
    if (!currentCredentials || !currentCredentials.refresh_token) {
      return throwError(() => new Error('No refresh token available'));
    }

    const formData = new FormData();
    formData.append('grant_type', 'refresh_token');
    formData.append('client_id', this.ISLAPLAY_CLIENT_ID);
    formData.append('refresh_token', currentCredentials.refresh_token);

    return this.httpCli.post<IslaplayAuthResponse>('https://api.picta.cu/o/token/', formData).pipe(
      tap(response => {
        // Update credentials with new tokens
        const updatedCredentials: Credentials = {
          ...currentCredentials,
          access_token: response.access_token,
          refresh_token: response.refresh_token || currentCredentials.refresh_token
        };
        
        this.credentialsService.setCredentials(updatedCredentials);
        
        this.islaplayTokenSubject.next(response.access_token);
        this.islaplayRefreshTokenSubject.next(response.access_token);
      }),
      catchError(error => {
        console.error('Islaplay refresh token error:', error);
        this.logoutIslaplay();
        return throwError(() => new Error('Token refresh failed'));
      })
    );
  }

  /**
   * Logout from Islaplay
   */
  logoutIslaplay(): void {
    this.credentialsService.setCredentials();
    this.islaplayTokenSubject.next(null);
    this.islaplayUserSubject.next(null);
    this.router.navigate(['/inicio']);
  }

  /**
   * Get Islaplay token from credentials
   */
  getIslaplayToken(): string | null {
    const credentials = this.credentialsService.credentials;
    return credentials ? credentials.access_token : null;
  }

  /**
   * Get Islaplay refresh token from credentials
   */
  getIslaplayRefreshToken(): string | null {
    const credentials = this.credentialsService.credentials;
    return credentials ? credentials.refresh_token : null;
  }

  /**
   * Get Islaplay user from credentials
   */
  getIslaplayUser(): IslaplayUser | null {
    const credentials = this.credentialsService.credentials;
    return credentials && credentials.user ? credentials.user : null;
  }

  /**
   * Check if Islaplay user is authenticated
   */
  isIslaplayAuthenticated(): boolean {
    return this.credentialsService.isAuthenticated();
  }

  /**
   * Check if Islaplay is refreshing
   */
  getIsIslaplayRefreshing(): boolean {
    return this.isIslaplayRefreshing;
  }

  /**
   * Set Islaplay refreshing state
   */
  setIsIslaplayRefreshing(value: boolean): void {
    this.isIslaplayRefreshing = value;
  }

  /**
   * Get Islaplay refresh token subject for request queuing
   */
  getIslaplayRefreshTokenSubject(): BehaviorSubject<string | null> {
    return this.islaplayRefreshTokenSubject;
  }
}
