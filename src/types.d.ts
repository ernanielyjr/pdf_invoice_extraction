declare module "ofx" {
  export = {
    serialize: (header: any, body: any) => string,
  };
}
