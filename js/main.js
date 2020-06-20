$(document).ready(function () {

    var navListItems = $('div.setup-panel div a'),
        allWells = $('.setup-content'),
        allNextBtn = $('.nextBtn');

    allWells.hide();

    navListItems.click(function (e) {
        e.preventDefault();
        var $target = $($(this).attr('href')),
            $item = $(this);

        if (!$item.hasClass('disabled')) {
            navListItems.removeClass('btn-success').addClass('btn-default');
            $item.addClass('btn-success');
            allWells.hide();
            $target.show();
            $target.find('input:eq(0)').focus();
        }
    });

    allNextBtn.click(function () {
        var curStep = $(this).closest(".setup-content"),
            curStepBtn = curStep.attr("id"),
            nextStepWizard = $('div.setup-panel div a[href="#' + curStepBtn + '"]').parent().next().children("a"),
            curInputs = curStep.find("input[type='text'],input[type='url']"),
            isValid = true;

        $(".form-group").removeClass("has-error");
        for (var i = 0; i < curInputs.length; i++) {
            if (!curInputs[i].validity.valid) {
                isValid = false;
                $(curInputs[i]).closest(".form-group").addClass("has-error");
            }
        }

        if (isValid) nextStepWizard.removeAttr('disabled').trigger('click');
    });

    $('div.setup-panel div a.btn-success').trigger('click');
});

function preview() {
    frame.src=URL.createObjectURL(event.target.files[0]);
  }

  
function showimagepreview(input) { //image preview after select image
    
    if (input.files && input.files[0]) {
      var el =   document.getElementById("image")
      el.style.display = "block"
      var filerdr = new FileReader();
  
      filerdr.onload = function(e) {
        var img = new Image();
  
        img.onload = function() {
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          canvas.width = 250;
          canvas.height = canvas.width * (img.height / img.width);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
          // SEND THIS DATA TO WHEREVER YOU NEED IT
          var data = canvas.toDataURL('image/png');
  
          $('#imgprvw').attr('src', img.src);
          //$('#imgprvw').attr('src', data);//converted image in variable 'data'
        }
        img.src = e.target.result;
      }
      filerdr.readAsDataURL(input.files[0]);
    }
  }

  
function resizeImg() {
    var img = document.getElementById("imgprvw")
    img.style.width = "400px"  
    img.style.height = "400px"  
    console.log("done")  
}
function defualtImg() {
    var img = document.getElementById("imgprvw")
    img.style.width = "270px"  
    img.style.height = "270px"  
    console.log("done")  
}

var l = document.getElementById("download")
l.addEventListener('click', function () {
    let input = document.getElementById("url").value
    var e = document.getElementById("select");
    var strUser = e.options[e.selectedIndex].text;
    var blob = new Blob([ `Hello Sir! 
    The URL Is: ${input} 
    The Select Box Is: ${strUser}
    Thank you.` ], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "world.txt");
    console.log(strUser)

    
})

// 

$(function() {
    // properties
    var isCaptured = false;
    var thumbSize = 100;
    var imageCoords = {
        x: 0,
        y: 0
    };
    var imageScale = 1;
    var imageDimensions = {
        width: 0,
        height: 0,
        minScale: 0.01,
        maxScale: 1
    }
    var currentImage = null;
    var originalSettings = {
        coords: {
            x: 0,
            y: 0,
        },
        scale: 1,
        dimensions: {
            width: 0,
            height: 0,
            minimum: thumbSize
        }
    };
    var scaleCenter = {
        x: 0,
        y: 0
    };
    var grabCenter = false;
    var isShiftKeyDown = false;

    // dom dependencies
    var canvas = document.getElementById('imageCanvas');
    var ctx = canvas.getContext('2d');
    var canCon = $('.canvasCon');

    // methods
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    function refreshImage() {
        clearCanvas();
        boxed();
        ctx.drawImage(currentImage,
            imageCoords.x, imageCoords.y,
            imageDimensions.width * imageScale, imageDimensions.height * imageScale);
    }
    function resetImage() {
        if (!currentImage) return;
        imageDimensions.width = originalSettings.dimensions.width;
        imageDimensions.height = originalSettings.dimensions.height;
        imageScale = originalSettings.scale;
        imageCoords.x = originalSettings.coords.x;
        imageCoords.y = originalSettings.coords.y;

        refreshImage();
    }
    function handleImage(e){
        var reader = new FileReader();
        reader.onload = function(event){
            currentImage = new Image();
            currentImage.onload = function(){
                imageCoords.x = 0;
                imageCoords.y = 0;
                originalSettings.dimensions.width = currentImage.width;
                imageDimensions.width = currentImage.width;
                originalSettings.dimensions.height = currentImage.height;
                imageDimensions.height = currentImage.height;
                var maxDim = Math.max(imageDimensions.height, imageDimensions.width);
                var minDim = originalSettings.dimensions.minimum =  Math.min(imageDimensions.height, imageDimensions.width);
                var op = (minDim < thumbSize) ? "show" : "hide";
                $('.error')[op]();
                if (minDim < thumbSize) {
                    canCon.hide();
                    $('#reset,#crop,.instructions,.cropResult').hide();
                    return;
                }
                imageScale = 1;
                originalSettings.dimensions.scale = 1;
                imageDimensions.maxScale = 1;
                if (maxDim > canvas.width) {
                    imageScale =
                    originalSettings.dimensions.scale = canvas.width / maxDim;
                }
                imageDimensions.minScale = thumbSize / minDim;
                boxed();
                // center image
                var above = thumbSize - imageCoords.y;
                var below = imageCoords.y + (imageDimensions.height * imageScale) - (thumbSize * 2);
                var overlap = (above + below) / 2;
                
                imageCoords.y += (above - overlap);
                
                above = thumbSize - imageCoords.x;
                below = imageCoords.x + (imageDimensions.width * imageScale) - (thumbSize * 2);
                overlap = (above + below) / 2;
                
                imageCoords.x += (above - overlap);

                canCon.show();
                $('#reset,#crop,.instructions').show();
                refreshImage();
            }
            currentImage.src = event.target.result;
        }
        reader.readAsDataURL(e.target.files[0]);     
    }
    function startScaling(newPoint, scale) {
        scaleCenter.y = imageCoords.y + ((originalSettings.dimensions.height * scale) / 2);        
        scaleCenter.x = imageCoords.x + ((originalSettings.dimensions.width * scale) / 2);
        grabCenter = false;
    }
    function scaleByCenter(coords, scale) {
        coords.y = scaleCenter.y - ((originalSettings.dimensions.height * scale) / 2);
        coords.x = scaleCenter.x - ((originalSettings.dimensions.width * scale) / 2);
    }
    // referee who makes sure the image is in the box
    function boxed() {
        imageCoords.x = Math.min(thumbSize,imageCoords.x);
        imageCoords.y = Math.min(thumbSize,imageCoords.y);
        
        imageCoords.x = Math.max(imageCoords.x, (thumbSize * 2) - (imageDimensions.width * imageScale));
        imageCoords.y = Math.max(imageCoords.y, (thumbSize * 2) - (imageDimensions.height * imageScale));
    }

    // event handlers
    $('#imageLoader').on('change', handleImage);
    $('#crop').click(function(e) {
        e.preventDefault();
        if (!currentImage) return;        
        var cropCanvas = $('#cropCanvas').get(0);
        cropCanvas.getContext('2d').drawImage(canvas,
            thumbSize, thumbSize, thumbSize, thumbSize,
            0, 0, thumbSize, thumbSize);
        var newPhotoUri = cropCanvas.toDataURL('image/jpeg');
        $('.cropResult img').attr('src', newPhotoUri);
        $('.cropResult').show();
    });
    $('#reset').click(function(e) {
        e.preventDefault();
        resetImage();
    });
    $(document).bind('keyup keydown', function (e) {
        isShiftKeyDown = e.shiftKey;
        if (isShiftKeyDown) {
            canCon.css('cursor', 'ns-resize');
            if (isCaptured) {
                grabCenter = true;
            }
        } else {
            canCon.css('cursor', 'move');
        }
    });
    canCon.on('selectstart', false).on("mousedown.cropper", function (e) {
        var originalPoint = {
            x: e.clientX,
            y: e.clientY
        };
        var originalCoords = {
            x: imageCoords.x,
            y: imageCoords.y,
            scale: imageScale
        };
        if (isShiftKeyDown) {
           startScaling(originalPoint, imageScale);
        }
        grabCenter = false;
        var originalScale = imageScale;
        isCaptured = true;
        $(document).on('mousemove.cropper', function (e) {
            var newPoint = {
                x: e.clientX,
                y: e.clientY
            };
            if (grabCenter) {
                startScaling(newPoint, imageScale);
            }
            var delta = {
                x: newPoint.x - originalPoint.x,
                y: newPoint.y - originalPoint.y
            };

            if (isShiftKeyDown) {
                var moveScale = Math.max(-0.08, -0.000001 * Math.pow(originalCoords.scale * originalSettings.dimensions.minimum, 1.7));
                imageScale = Math.max(imageDimensions.minScale, Math.min(imageDimensions.maxScale, originalScale + (delta.y * moveScale)));
                console.log('cur='+imageScale);
                console.log('min,max='+imageDimensions.minScale+','+imageDimensions.maxScale);
                scaleByCenter(imageCoords, imageScale);
            } else {
                imageCoords.x = originalCoords.x + delta.x;
                imageCoords.y = originalCoords.y + delta.y;
            }
            refreshImage();
        }).on('mouseup.cropper', function (e) {
            isCaptured = false;
            $(document).off('mousemove.cropper').off('mouseup.cropper');
            refreshImage();
        });
    });
});
