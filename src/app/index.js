var html = require('./index.html')
var css = require('./index.less')

class FreelogMemeResourceRender extends HTMLElement {
  constructor() {
    super()
    let self = this;
    let shadowRoot = self.attachShadow({mode: 'open'});
    shadowRoot.innerHTML = `<style>${css}</style>` + html
    self.root = shadowRoot
  }

  connectedCallback (){
    this.init()
  }

  init (){
    this.getDom()

    this.imgSrc = this.getAttribute('data-src')
    var descArr = decodeURIComponent(this.getAttribute('data-desc'))
    
    try{
      this.descArr = JSON.parse(descArr)
      this.renderImg()
    }catch(e){
      console.error(e)
    }
  }

  getDom (){
    this.$imgBox = this.root.querySelector('#freelog-memerender2-wwzh-app')
  }

  fethchResourcesList (type = '', tags = '', isOnline = 1){
    var tagsQueryStr = '', targTypeStr = ''
    if(tags != ''){
      tagsQueryStr = `&tags=${tags}`
    }
    if(type != ''){
      targTypeStr = `&resourceType=${type}`
    }
    return window.FreelogApp.QI.fetch(`/v1/presentables?nodeId=${window.__auth_info__.__auth_node_id__}&isOnline=${isOnline}${targTypeStr}${tagsQueryStr}`)
    .then(resp => resp.json())
  }

  fetchResourceDetail (presentableId, resourceId){
    return window.FreelogApp.QI.fetch(`/v1/auths/presentable/${presentableId}.info?nodeId=${window.__auth_info__.__auth_node_id__}&resourceId=${resourceId}`)
            .then(resp => resp.json())
  }

  renderImg (){
    var imgHtml = this.getImageHtml()
    var introHtml = this.getIntroHtml()
    this.$imgBox.innerHTML = `
      ${imgHtml}
      ${introHtml}
    `
  }

  getImageHtml (){
    return `<image class="meme-img" src="${this.imgSrc}" />`
  }

  getIntroHtml (){
    return this.descArr.map(it => {
                      
      // "position": {                                   
      //     "x": "2%", 
      //     "y": "1%"
      // },
      // "size": {
      //     "width": "50%",                             
      //     "height": "30%"                        
      // },
      // "fontSize": 24,                                  
      // "color": "#ffffff",                              
      // "textAlign": "center"  
      var styleStr = this.getStyleStr(it)
      return `
        <div class="meme-intro" style="${styleStr}">${it.name}</div>
      `
      
    }).join(' ')
  }

  getStyleStr (obj){
    
    var str = ''
    for(let prop in obj){
      switch(prop){
        case 'position': {}
        case 'size': {
          str += this.getStyleStr(obj[prop])
          break
        }
        case 'x': {
          str += `left: ${this.formatStyleValue(obj[prop])};`
          break
        }
        case 'y': {
          str += `top: ${this.formatStyleValue(obj[prop])};`
          break
        }
        case 'left': {}
        case 'right': {}
        case 'top': {}
        case 'bottom': {}
        case 'width': {}
        case 'height': {}
        case 'fontSize': {
          if(obj[prop] == '') break
          var name = this.formatStyleProp(prop),
              value = this.formatStyleValue(obj[prop])
          str += `${name}: ${value};`
          break
        }
        case 'color': {}
        case 'textAlign': {
          var name = this.formatStyleProp(prop),
              value = obj[prop]
          str += `${name}: ${value};`
          break
        }
        default: {
          break 
        }
      }
    }
    return str
  }

  formatStyleProp (prop){
    return prop.replace(/[A-Z]/g, (s) => '-' + s.toLocaleLowerCase())
  }

  formatStyleValue (value){
    
    return /(%|px)$/.test(value) ? value : value + 'px'
  }
}

customElements.define('freelog-meme-resource-render', FreelogMemeResourceRender)
