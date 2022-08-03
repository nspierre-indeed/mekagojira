class Utils {

  constructor() {

  }

  static getRandomColor(not) {
    var colors = [
      "#2196F3",
      "#00BCD4",
      "#009688",
      "#8AC249",
      "#CDDC39",
      "#FFEB3B",
      "#FF9800",
      "#F44336",
      "#F0134C",
      "#E91E63",
      "#9C27B0"
    ],
    pickedColor,
    localColors = colors.slice(0);

    if (not) {
      localColors.splice(localColors.indexOf(not),1);
    }

    pickedColor = localColors[Math.floor(Math.random()*localColors.length)];

    return pickedColor;
  }

  static getThemes() {
    return Object.keys(Themes.map);
  }

  static escapeHtml(string) {
    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
    };
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

}

export default Utils;
