var file = document.getElementById("file");
    var canvas = document.getElementById("canvas");
    var uploadImgSrc;
    var ctx = canvas.getContext("2d");
    let string = [];
    var StartTime;
    var EndTime;

    function clearOutputs() {
      canvas.width = 0;
      canvas.height = 0;
      document.getElementById("timing").innerHTML = "";
      document.getElementById("URL").innerHTML = "";
      document.getElementById("status").innerHTML = "";
      console.log("outputs cleared");
    }

    window.onload = clearOutputs();

    if(window.File && window.FileReader && window.FileList && window.Blob){
      function loadLocalImage(e) {
        var fileData = e.target.files[0];
        var ext = fileData.name.split(".").slice(-1)[0];
        var reader = new FileReader();
        clearOutputs();
        if(fileData.type == "image/x-portable-bitmap" || ext == "pbm" || ext == "pgm" || ext == "pnm" || ext == "ppm"){
          getStartTime();
          reader.onload = function() {
            document.getElementById("status").innerHTML = "このファイル形式はプレビューを表示することができません。"
            console.log("no previews for NetPBM format");
            var img = new Uint8Array(reader.result);
            getURL(img);
            getEndTime();
          }
          reader.readAsArrayBuffer(fileData);
        }else if(fileData.type.match("image.*")){
          getStartTime();
          reader.onload = function() {
            var img = new Image();
            img.src = reader.result;
            img.onerror = function() {
              clearOutputs();
              console.log("Error: Invalied Image" + fileData.name);
              alert("エラー：無効な画像です。");
              document.getElementById("status").innerHTML = "エラーが発生しました。";
            }
            img.onload = function() {
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              ctx.drawImage(img, 0, 0,canvas.width,canvas.height);
              ctx.rect(0,0,canvas.width,canvas.height);
              ctx.strokeStyle = "black";
              ctx.lineWidth = 1;
              ctx.stroke();
              getURL(img);
            }
          }
          reader.readAsDataURL(fileData);
        }else{
          console.log("Error: Non-Image File");
          alert("画像ファイルを選択してください。");
          document.getElementById("status").innerHTML = "アップロードされたファイルは画像ではありません";
          return;
        }
      }
    }else{
      file.style.display = "none";
      console.log("Error: File APIs not supported");
      alert("APIに対応したブラウザで試してみてください。");
    }
    file.addEventListener("change", loadLocalImage, false);

    function getStartTime(){
    StartTime = performance.now();
    console.log("processing...");
    document.getElementById("timing").innerHTML = "処理中..."
    }

    function getEndTime() {
    EndTime = performance.now();
    console.log("The process has been completed successfully in " + (EndTime - StartTime)/1000 + " seconds");
    document.getElementById("timing").innerHTML += "<br>" + Math.round(EndTime - StartTime)/1000 + "秒で処理が正常に完了しました。"
    }

    function getURL(ImgFile) {
        const worker = new Tesseract.TesseractWorker();
          worker.recognize(ImgFile)
          .progress(function(message){
             document.getElementById('timing').innerHTML = "処理中..."　+ Math.round(message.progress*1000)/10 + "％完了";
             console.log(message);
          })
          .then(function(result){
            string = result.text;
            console.log("raw string: " + string);
            string = (string.match(/((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g));
            if(string === null){
              console.log("unable to recognise URLs from the image");
              document.getElementById("URL").innerHTML = "画像からURLを認識できませんでした。";
              document.getElementById("URL").style.color = "red";
            }else{
              console.log("URLs have been recognised successfully: " + string);
              for(var i = 0; i < string.length; i++){
                document.getElementById("URL").innerHTML += "No. " + (i+1) + ": " + "<a href=string[i]>" + string[i] + "</a><br>";
              }
            }
              getEndTime(StartTime);
            })
            .catch(function(err){
              console.error(err);
            });
          }
