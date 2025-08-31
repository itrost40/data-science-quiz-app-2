// Seeded random number generator for consistent quiz generation
export class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    // Simple LCG (Linear Congruential Generator) algorithm
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}