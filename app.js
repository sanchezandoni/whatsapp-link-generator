var app = new Vue({
  el: '#app',
  data: {
    phoneNumbersTextarea: "",
    messageTextarea: "",
    prefix: "",
    helpModal: false
  },
  computed: {
    parsedMessage(){
      let originalMessage = htmlEntities(this.messageTextarea);

      return whatsappStyles(originalMessage);

      // Old incomplete solution. Works, but takes so long for some strings.
      /*
      let bold = /\b\*((<(s|b|i|code)>)?((\w+\s?)+(\S))(<\/(\3)>)?)\*\b/g;
      let italic = /\b_((<(s|b|i|code)>)?((\w+\s?)+(\S))(<\/(\3)>)?)_\b/g;
      let strikethrough = /\b~((<(s|b|i|code)>)?((\w+\s?)+(\S))(<\/(\3)>)?)~\b/g;

      let newLine = /\n/gm;

      let parsedMessage = originalMessage
        .replace(bold,`<b>$1</b>`)
        .replace(italic,`<i>$1</i>`)
        .replace(strikethrough,`<s>$1</s>`)
        .replace(newLine,`<br>`);
      return parsedMessage;
      */
    },
    phoneNumbers(){
      let prefix = Number.isInteger(parseInt(this.prefix)) ? this.prefix : "";

      function generatePrefixedNumber(number){
        return `${prefix}${number}`;
      }

      if (this.phoneNumbersTextarea.length){
        let numbers = this.phoneNumbersTextarea.split("\n").filter(n=>Number.isInteger(parseInt(n)));
        return numbers.map(generatePrefixedNumber);
      }else{
        return [];
      }
    },
    links(){
      let message = this.messageTextarea;

      function generateLink(number){
        return {
          link: encodeURI(`https://api.whatsapp.com/send?phone=${number}&text=${message}`),
          number: number
        }
      }

      return this.phoneNumbers.map(generateLink)
    }
  },
  methods:{
    showModal(){
      this.helpModal = true;
    },
    hideModal(){
      this.helpModal = false;
    },
    buttonClicked(event){
      event.target.classList.replace("is-link","is-light");
      return true;
    }
  }
})

/*
 * Thanks @sankalp179! 
 * https://github.com/sankalp179/whatsapp-formatter
*/
function whatsappStyles(message){
  var format = message;
  format = whatsappStyle(format,'_', '<i>', '</i>');
  format = whatsappStyle(format,'*', '<b>', '</b>');
  format = whatsappStyle(format,'~', '<s>', '</s>');
  format = format.replace(/\n/gi,"<br>");
  return format;

  function is_aplhanumeric(c){
    var x = c.charCodeAt();
    return ((x>=65&&x<=90)||(x>=97&&x<=122)||(x>=48&&x<=57))?true:false;
  }

  function whatsappStyle(format,wildcard, opTag, clTag) {
    var indices = [];
    for(var i = 0; i < format.length; i++) {
      if (format[i] === wildcard) {
        if(indices.length%2)
          (format[i-1]==" ")?null:((typeof(format[i+1])=="undefined")?indices.push(i):(is_aplhanumeric(format[i+1])?null:indices.push(i)));
        else
          (typeof(format[i+1])=="undefined")?null:((format[i+1]==" ")?null:(typeof(format[i-1])=="undefined")?indices.push(i):((is_aplhanumeric(format[i-1]))?null:indices.push(i)));
      }
      else{
        (format[i].charCodeAt()==10 && indices.length % 2)?indices.pop():null;
      }
    }
    (indices.length % 2)?indices.pop():null;
    var e=0;
    indices.forEach(function(v,i){
      var t=(i%2)?clTag:opTag;
        v+=e;
      format=format.substr(0,v)+t+format.substr(v+1);
      e+=(t.length-1);
    });
    return format;
  }
}

/*
 * Taken from https://css-tricks.com/snippets/javascript/htmlentities-for-javascript/
*/
function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}