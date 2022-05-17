declare module 'cyrillic-to-translit-js' {

  export type CyrillicToTranslit = {
    transform(input: string, spaceReplacement?: string): string;
    reverse(input: string, spaceReplacement?: string): string;
  }

  export type Configuration = { 
    preset: "ru" | "uk" | "mn";
  }
  
  const cyrillicToTranslit: (config?: Configuration) => CyrillicToTranslit
  
  export default cyrillicToTranslit
}