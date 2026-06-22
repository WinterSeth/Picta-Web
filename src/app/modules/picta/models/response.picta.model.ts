export interface PictaResponse<T> {
  'count': number,
  next: number,
  previous: string,
  results: T[]
}
