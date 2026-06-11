declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// أو إذا كنت تستخدم CSS Modules بشكل أساسي، يكفي:
declare module '*.css';
declare module '*.scss';