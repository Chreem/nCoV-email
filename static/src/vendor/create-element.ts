interface ParamsType {
  id?: string,
  className?: string
}

export default (tagName: string, params?: ParamsType) => {
  const tag = document.createElement(tagName);
  if (params && params.constructor === Object) {
    Object
      .keys(params)
      .map(key => {
        const value = params[key];
        if (!value) return;
        tag[key] = params[key];
      })
  }
  return tag;
}