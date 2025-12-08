declare const SRC: string

declare module "inline:*" {
  const content: string
  export default content
}

declare module "*.scss" {
  const content: string
  export default content
}

declare module "*.blp" {
  const content: string
  export default content
}

declare module "*.css" {
  const content: string
  export default content
}

declare module "gi://AstalNetwork" {
    const AstalNetwork: any;
    export default AstalNetwork;
}

declare module "gi://AstalNetwork?version=1.0" {
    const AstalNetwork: any;
    export default AstalNetwork;
}

declare module "gi://AstalWp" {
    const AstalWp: any;
    export default AstalWp;
}