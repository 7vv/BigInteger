const BigInt = (function () {
    //Use calculate pattern
    const pattern = /[+-/*]/

    //x+y, x-y ...
    this.Calc = (ope) => {
        if (typeof ope !== 'string') return ope;
        if (!ope.match(pattern)) return ope;
        ope = ope.replace(/\+\-/,'-');
        const o = pattern.exec(ope)[0];
        const x = ope.split(o)[0] || [];
        const y = ope.split(o)[1] || [];
        return o == '-' ? this.M(x, y) :
               o == '+' ? this.P(x, y) :
               o == '/' ? this.D(x, y) : this.X(x, y);
    };

    //+
    this.P = (x, y) => {          
        x = this.toStr(x)
        y = this.toStr(y)     
        let first = '';
        if(x.includes('-') && y.includes('-')) first = '-';
        if(x.includes('-')) return this.M(x.replace(/\-/,''), y, 'x'); 
        if(y.includes('-')) return this.M(x, y.replace(/\-/,''), 'y'); 
        const result = [];
        let next = 0;
        const _ = this.T(x, y, true);
        for (let i = 0; i <= _.long.length; i++) {
            if (!_.long[i]){
                if(next >= 1) result[i] = next;
                continue;
            }
            result[i] = +_.long[i] + (+_.small[i] || 0) + next;
            if (result[i] < 10000) next = 0;
            else {
                result[i] = result[i] - 10000;
                next = 1;
            }
        }                
        return '"'+first+this.F(result).reverse().join('')+'"';
    };

    //-
    this.M = (x, y, o) => {          
        x = this.toStr(x)
        y = this.toStr(y)         
        const result = [];
        let next = 0;    
        let first = ''
        const _ = this.T(x, y, true);
        for (let i = 0; i < _.long.length; i++) {
            if (!_.long[i]) continue;
            result[i] = +_.long[i] - (+_.small[i] || 0) - next;
            if (result[i] >= 0) next = 0;
            else {
                result[i] = result[i] + 10000;
                next = 1;
            }
        }
        const temp = this.F(result).reverse().join('');     
        if(o == 'x') return '"-' + temp + '"';  
        return _.who == 'y' ? '"-' + temp + '"' : '"'+temp+'"';
    };

    //×
    this.X = (x, y) => {          
        x = this.toArr(x)
        y = this.toArr(y)

        const temp = [];
        let dep = '';
        let next = '';  
        let result = '0'; 
        for(j = y.length; j--;){  
            for(i = x.length; i--;){                           
                temp.push(+y[j] * +x[i] +dep + next);  
                dep += '0';              
            }
            next += '0'
            dep = ''            
        }                                       
        for(const n of temp){
            result = this.P(n, result);
        }        
        return '"' +result + '"'
    };

    //÷
    this.D = (x, y) => {
        x = this.toStr(x)
        y = this.toStr(y)
        let test = '0'
        let ss = ''
        let numArr = ['1'];
        let result = '';
        for (i = x.length - 1; i--;) numArr.push('0');
        for (const i in x) {
            let stack = 1;                   
            while(true){
                let num = this.X(numArr.join(''), stack).replace(/"/g,'');
                if(+y * num <= +x){
                    stack++;
                    continue;
                }else if(stack > 1){
                    stack--;
                    result+= stack;   
                    x = this.M(x, this.X(this.X(numArr.join(''), stack).replace(/"/g,''), y).replace(/"/g,'')).replace(/"/g,'')                 
                }else result += 0;                  
                break;      
            }            
            numArr.pop(); 
        }                        
        return '"' +result.replace(/^0+/, '') + '"'
    };

    // 10e3 => 1000 
    this.POW = (x, max) => {
        let result = x;
        if(max == '0') return 1;
        for(let i =1; i<max; i++){            
            result = this.X(result, x);
        }
        return result;
    }

    //str to Array
    this.T = (x, y, cut) => {
        let who = '';
        let long;
        let small;
        x = x+'';
        y = y+'';
        x_cut = x.length > 4 ? x.replace(/\B(?=(\d{4})+(?!\d))/g, ",").split(',').reverse() : [x];
        y_cut = y.length > 4 ? y.replace(/\B(?=(\d{4})+(?!\d))/g, ",").split(',').reverse() : [y];
        
        if (x.length == y.length) {
            if (+x[0] >= +y[0]) {
                who = 'x';
                long = x_cut;
                small = y_cut;
            } else {
                who = 'y';
                long = y_cut;
                small = x_cut;
            }
        } else {
            if (x.length > y.length) {
                who = 'x'
                long = x_cut;
                small = y_cut;
            } else {
                who = 'y'
                long = y_cut;
                small = x_cut;
            }
        }
        return { long: long, small: small, who: who }
    }

    this.toNum = x => Number(x.replace(/"/gi, ''));
    this.toStr = x => String(x).replace(/"/g,'');
    this.toArr= x => toStr(x).split('');

    //Fill with 0
    this.F = (result) => {
        return result.map((e, i) => {
            e = e+'';
            if (result.length - 1 == i) return e == '0' ? '' : e;
            if (e == '0') return '0000';
            if (e.length == 1) return '000' + e;
            if (e.length == 2) return '00' + e;
            if (e.length == 3) return '0' + e;
            return e;
        })
    }
    return this;
})();
