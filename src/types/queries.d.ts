// for pagination
interface Paginated<T> {
  count: number;
  rows: T[];
}
