declare module '!!worker-loader!*.js' {}
declare module '!!raw-loader!*.css' {
  export default content as string;
}
