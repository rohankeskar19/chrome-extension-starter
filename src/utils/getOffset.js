const getOffset = (el) => {
  //   var _x = 0;
  //   var _y = 0;
  //   while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
  //     _x += el.offsetLeft - el.scrollLeft;
  //     _y += el.offsetTop - el.scrollTop;
  //     el = el.offsetParent;
  //   }
  //   return { top: _y, left: _x };

  const bodyRect = document.body.getBoundingClientRect();
  const elemRect = el.getBoundingClientRect();
  const top = elemRect.top - bodyRect.top;
  const left = elemRect.left;

  return { top, left };
};

export default getOffset;
