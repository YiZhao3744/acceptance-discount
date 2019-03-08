export class Helper {

  public static transform(val: string) {
    let arr = '';
    for (let i = 0; i < val.length; i++) {
      if (val[i] !== ',') {
        arr += val[i];
      }
    }
    return Number(arr);
  }

  public static numFormat(num: number) {
    let res = num.toString().replace(/\d+/, n => {
      return n.replace(/(\d)(?=(\d{3})+$)/g, v => {
        return v + ",";
      });
    })
    return res;
  }

  public static numberCheck(num) {
    let str = num;
    let len1 = str.substr(0, 1);
    let len2 = str.substr(1, 1);
    
    //如果第一位是0，第二位不是点，就用数字把点替换掉
    if (str.length > 1 && len1 == 0 && len2 != ".") str = str.substr(1, 1);
    
    //第一位不能是.
    if (!Helper.isNumber(len1)) str = "";
    
    //限制只能输入一个小数点
    if (str.indexOf(".") != -1) {
      let str_ = str.substr(str.indexOf(".") + 1);
      if (str_.indexOf(".") != -1) {
        str = str.substr(0, str.indexOf(".") + str_.indexOf(".") + 1);
      }
    }
    //正则替换，保留数字和小数点
    str = str.replace(/[^\d^\.]+/g, '')
    return str;
  }

  public static isNumber(val: any): boolean {
    return val === +val;
  }
}