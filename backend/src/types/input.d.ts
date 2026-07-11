declare module 'input' {
  const input: {
    text(prompt: string): Promise<string>;
    [key: string]: unknown;
  };
  export default input;
}
