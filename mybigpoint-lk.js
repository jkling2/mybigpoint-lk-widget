// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: chart-line;

let personalID = args.widgetParameter != null && args.widgetParameter.split(',')[0] ? args.widgetParameter.split(',')[0] : "29300539";
let clubID = args.widgetParameter != null && args.widgetParameter.split(',').length > 1 ? args.widgetParameter.split(',')[1] : "20206";
let url = `https://www.wtb-tennis.de/spielbetrieb/vereine/verein/spieler/v/${clubID}.html`;
let currMonth = new Date().getMonth();
let version = (currMonth > 3 && currMonth < 10) ? "2.0" : "3.0";

const fm = FileManager.iCloud();
const dir = fm.joinPath(fm.documentsDirectory(), "mybigpoint-lk");
const backgroundImgPath = fm.joinPath(dir, `backgroundImg_${version}`);
if(!fm.fileExists(dir)){
	fm.createDirectory(dir);
}
// load logo from file (if not present, download first)
if (!fm.fileExists(backgroundImgPath)) {
	let reqImg = new Request(`https://spieler.tennis.de/documents/20126/36233/PRIVATE_PROFILE_BG.jpg/ea22e842-8ab8-d491-e2c6-1751db01570a?version=${version}`);
	reqImg.headers = {
			"Accept": "image/webp,*/*"
		};
	let img = await reqImg.loadImage();
	fm.writeImage(backgroundImgPath, img);
}
const backgroundImg = fm.readImage(backgroundImgPath);

let webview = new WebView();
await webview.loadURL(url);

var getData = `
  function getData(){
			a = []
            x = document.getElementsByTagName("td");
            for(s of x){
                a.push(s.innerText)
            }
            return a
         } getData()
          `

let response = await webview.evaluateJavaScript(getData, false);

// build widget
let widget = new ListWidget();
widget.backgroundImage = backgroundImg;
if (response) {
	for (let idx in response) {
		if (response[idx] == personalID) {
         	let textName = widget.addText(response[idx - 1]);
        	textName.font = Font.mediumSystemFont(20);	
		textName.textColor = Color.white();
		textName.rightAlignText();
		widget.addSpacer(40);
	     let textLK = widget.addText(response[idx - 2]);
        	textLK.font = Font.mediumSystemFont(35);	
		textLK.textColor = Color.white();
		textLK.rightAlignText();
          break;
		}
	}
} else {
	// data could not be read
	let text = widget.addText("Check 📶 connection");
	text.font = Font.mediumSystemFont(18);
	text.textColor = new Color("#7393b3");
	text.centerAlignText();
}
// run widget
if (!config.runsInWidget) {	
	await widget.presentSmall();
}
Script.setWidget(widget);
Script.complete();
