export class Helper {
    public static  transform(val: string) {
        let arr = '';
        for (let i = 0; i < val.length; i++) {
         if(val[i] !== ',') {
           arr += val[i];
         }
        }
        return Number(arr);
      }

    public static  numFormat(num: number) {
        let res = num.toString().replace(/\d+/, n => { 
             return n.replace(/(\d)(?=(\d{3})+$)/g, v => {
                return v + ",";
              });
        })
        return res;
      }
}