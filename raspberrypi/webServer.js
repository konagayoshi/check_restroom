// クライアントからのレスポンスを受け取り、適切なファイルに処理を依頼する

// 必要なファイルを読み込み
var http = require('http');
var url = require('url');
var fs = require('fs');
var server = http.createServer();

var os = require('os');
let interfaces = os.networkInterfaces();

//var BBCMicrobit = require('../index'); // or require('bbc-microbit')
var BBCMicrobit = require('../chibibit_ble_test/node_modules/bbc-microbit/index'); // or require('bbc-microbit')

var pin = 0;

var tmp_pin = 0;
var tmp_value = 0;
var tmp_address;

for (let dev in interfaces) {
    interfaces[dev].forEach((details) => {
        if (details.internal || details.family !== 'IPv4') return;
	tmp_address = details.address;
    });
}

console.log('Scanning for microbit');
BBCMicrobit.discover(function(microbit) {
  console.log('\tdiscovered microbit: id = %s, address = %s', microbit.id, microbit.address);

  microbit.on('disconnect', function() {
    console.log('\tmicrobit disconnected!');
    process.exit(0);
  });

    microbit.on('pinDataChange', function(pin, value) {
	tmp_pin = pin;
	tmp_value = value;
    console.log('\ton -> pin data change: pin = %d, value = %d', pin, value);
  });

  console.log('connecting to microbit');
  microbit.connectAndSetUp(function() {
    console.log('\tconnected to microbit');

    console.log('setting pin %d as input', pin);
    microbit.pinInput(pin, function() {
      console.log('\tpin set as input');

      console.log('setting pin %d as analog', pin);
      microbit.pinAnalog(pin, function() {
        console.log('\tpin set as analog');

        console.log('subscribing to pin data');
        microbit.subscribePinData(function() {
          console.log('\tsubscribed to pin data');
        });
      });
    });
  });
});

// http.createServerがrequestされたら、(イベントハンドラ)
server.on('request', function (req, res) {
    // Responseオブジェクトを作成し、その中に必要な処理を書いていき、条件によって対応させる
    var Response = {
        "renderHTML": function () {
            var template = fs.readFile('./template/index.html', 'utf-8', function (err, data) {
                // HTTPレスポンスヘッダを出力する
                res.writeHead(200, {
                    'content-Type': 'text/html'
                });

                // HTTPレスポンスボディを出力する
//                res.write(data);

		var header = [
		    "<!DOCTYPE html>",
		    "<html lang='en'>",
		    "<head>",
		    "    <meta charset='UTF-8'>",
		    "    <title>トイレ空室確認サーバ</title>",
		    "    <meta http-equiv='refresh' content='2;URL=http://" + tmp_address + ":8080'>",
		    "<style type='text/css'><!--",
		    "table{width:100;}",
		    "//--></style>",
		    "</head>",
		    "<body>",
		    "  <h1>トイレ空室確認サーバ</h1>"
		].join("");
		
		var state;

		if( tmp_value < 50 )
		    state = "<font color='#ff0000'>先客</font>";
		else
		    state = "空き";

		var tbl_header = [
		    "<table border=1><tr>",
		    "<th>階数</th>",
		    "<th>No1</th>",
		    "<th>No2</th>",
		    "<th>No3</th>",
		    "<th>No4</th>"
		].join("");

		var tbl_footer = [
		    "</tr>",
		    "</table>"
		].join("");

		var floor = [
		    "<tr><th>1階</th><th>" + state + "</th><th>空き</th><th>空き</th><th>空き</th></tr>",
		    "<tr><th>2階</th><th>空き</th><th>空き</th><th>空き</th><th>空き</th></tr>",
		    "<tr><th>3階</th><th>空き</th><th>空き</th><th>空き</th><th>空き</th></tr>",
		    "<tr><th>4階</th><th>空き</th><th>空き</th><th>空き</th><th>空き</th></tr>",
		    "<tr><th>5階</th><th>空き</th><th>空き</th><th>空き</th><th>空き</th></tr>"
		].join("");
		
		res.end(header + tbl_header + floor + tbl_footer + "</body></html>");

            });

        },
};
    // urlのpathをuriに代入
    var uri = url.parse(req.url).pathname;


    // URIで行う処理を分岐させる
    if (uri === "/") {
        // URLが「http://localhost:8080/」の場合、"renderHTML"の処理を行う
        Response["renderHTML"](); 
        return;
    }
});

// 指定されたポート(8080)でコネクションの受け入れを開始する
server.listen(8080)
console.log('Server running at http://localhost:8080/');
