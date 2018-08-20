/**
 * 字符串转16进制数组
 */
let Str2Bytes  = (str)=>{
    let pos = 0;
    let len = str.length;
    if(len %2 != 0)
    {
    return null; 
    }
    len /= 2;
    let hexA = new Array();
    for(var i=0; i<len; i++)
    {
        let s = str.substr(pos, 2);
        let v = parseInt(s, 16);
       hexA.push(v);
       pos += 2;
    }
    return hexA;
}

/**
 * 16进制数组转字符串
 */
let Bytes2Str = (arr)=>{
    let str = "";
    for(let i=0; i<arr.length; i++)
    {
       let tmp = arr[i].toString(16);
       if(tmp.length == 1)
       {
           tmp = "0" + tmp;
       }
       str += tmp;
    }
    return str;
}

export default {
    Str2Bytes,
    Bytes2Str
}