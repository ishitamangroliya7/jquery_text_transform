
$(document).ready(function () {

    //dark mode
    $('#darkModeToggle').change(function () {
        $('body').toggleClass('dark-mode');
    });

    // swap button
    $('#swapButton').click(function () {
        var text1 = $('#floatingTextarea2').val();
        var text2 = $('#floatingTextarea3').val();
        $('#floatingTextarea2').val(text2);
        $('#floatingTextarea3').val(text1);
    });

    //image upload
    $('#uploadImageButton').click(function () {
        $('#imageUploadInput').click();
    });

    $('#uploadButton').click(function () {
        $('#imageUploadInput').click();
    });

    $('#imageUploadInput').change(function () {
        var file = $(this)[0].files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                if (confirm('You want to upload ' + file.name + '?')) {
                    pushToUndoStack();
                    $('#floatingTextarea2').hide();
                    $('#display-img').show();
                    $('#display-img').html('<img src="' + e.target.result + '" style="width: 80%; max-height: 300px">');

                    Tesseract.recognize(
                        e.target.result,
                        'eng',
                        {
                            logger: function (m) { console.log(m); }
                        }
                    ).then(function (result) {
                        $('#floatingTextarea3').val(result.data.text).css('height', '300px');
                        pushToUndoStack();
                    }).catch(function (err) {
                        $('#floatingTextarea3').val('Error extracting text: ' + err.message);
                    });
                    $('#swapButton').hide();
                } else {
                    $('#floatingTextarea2').val('Image is not uploaded.');
                    $('#floatingTextarea3').val('');
                }
            };
            reader.readAsDataURL(file);
        }
    });

    function updateSwapButtonVisibility() {
        if ($('#display-img').css('display') === 'none') {
            $('#swapButton').show();
        } else {
            $('#swapButton').hide();
        }
    }

    //listen text
    function textToSpeech() {
        var text = $('#floatingTextarea2').val();
        if ('speechSynthesis' in window) {
            var speech = new SpeechSynthesisUtterance(text);
            speech.lang = 'en-US';
            window.speechSynthesis.speak(speech);
        } else {
            alert('Text-to-speech is not supported in your browser.');
        }
    }

    $('#listenNowButton').click(function () {
        textToSpeech();
    });


    // undo and redo
    var undoStack = [];
    var redoStack = [];

    function pushToUndoStack() {
        undoStack.push({
            text1: $('#floatingTextarea2').val(),
            text2: $('#floatingTextarea3').val(),
            image: $('#display-img').html()
        });
        if (undoStack.length > 20) {
            undoStack.shift();
        }
        updateButtonStates();
    }
    function undo() {
        if (undoStack.length > 0) {
            const currentState = {
                text1: $('#floatingTextarea2').val(),
                text2: $('#floatingTextarea3').val(),
                image: $('#display-img').html()
            };
            redoStack.push(currentState);
            const previousState = undoStack.pop();
            $('#floatingTextarea2').val(previousState.text1);
            $('#floatingTextarea3').val(previousState.text2);
            $('#display-img').html(previousState.image);
            updateContentDisplay(previousState.image);
            updateButtonStates();
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            const currentState = {
                text1: $('#floatingTextarea2').val(),
                text2: $('#floatingTextarea3').val(),
                image: $('#display-img').html()
            };
            undoStack.push(currentState);
            const nextState = redoStack.pop();
            $('#floatingTextarea2').val(nextState.text1);
            $('#floatingTextarea3').val(nextState.text2);
            $('#display-img').html(nextState.image);
            updateContentDisplay(nextState.image);
            updateButtonStates();
        }
    }
    function updateContentDisplay(imageHtml) {
        if (imageHtml.trim()) {
            $('#floatingTextarea2').hide();
            $('#display-img').show();
            $('#floatingTextarea3').css('height', '300px');;
            $('#swapButton').hide();
        } else {
            $('#floatingTextarea2').show();
            $('#floatingTextarea3').css('height', '100px');
            $('#display-img').hide();
            $('#swapButton').show();
        }
    }
    function updateButtonStates() {
        $('#undoButton').prop('disabled', undoStack.length === 0);
        $('#redoButton').prop('disabled', redoStack.length === 0);
    }

    $('#undoButton').click(function () {
        undo();
    });

    $('#redoButton').click(function () {
        redo();
    });


    //other functionality using switch case
    function transformText(action) {
        var text = $('#floatingTextarea2').val();
        if (text === '') {
            alert('Please enter text.');
            return;
        }
        var result;
        switch (action) {
            case 'uppercase':
                result = text.toUpperCase();
                break;
            case 'lowercase':
                result = text.toLowerCase();
                break;
            case 'sentence':
                result = text.trim()
                    .replace(/([^.?!])$/, '$1.')
                    .replace(/(^|\.\s*|\?\s*|\!\s*)([a-zA-Z])/g, (match, boundary, char) => boundary + char.toUpperCase())
                    .replace(/\s*([.,!?;:])\s*/g, '$1 ')
                    .replace(/\s+/g, ' ')
                    .trim();
                break;
            case 'whitespace':
                result = text.replace(/\s+/g, ' ');
                break;
            case 'base64':
                result = btoa(text);
                break;
            case 'specialChar':
                result = text.replace(/[^\w\s]/gi, '');
                break;
            case 'reverse':
                result = text.split('').reverse().join('');
                break;
            case 'alternate':
                result = text.split('').map((char, index) => {
                    return index % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
                }).join('');
                break;
            case 'countword':
                result = text.trim().split(/\s+/).filter(word => word.length > 0).length;
                break;
            case 'countchar':
                result = text.length;
                break;
            case 'countline':
                result = text.split(/\r?\n/).length;
                break;
            case 'countspace':
                result = (text.match(/\s/g) || []).length;
                break;
            case 'removenewline':
                result = text.replace(/(\r\n|\n|\r)/gm, " ");
                break;
            case 'replaceword':
                var replaceFrom = prompt('Enter the word or phrase to replace:');
                var replaceTo = prompt('Enter the replacement:');
                var regex = new RegExp(replaceFrom, 'gi');
                result = text.replace(regex, replaceTo);
                break;
        }
        $('#floatingTextarea3').val(result);
        pushToUndoStack();
    }

    $('#Uppercase').click(function () { transformText('uppercase'); });
    $('#Lowercase').click(function () { transformText('lowercase'); });
    $('#Sentence').click(function () { transformText('sentence'); });
    $('#removeWhitespaceButton').click(function () { transformText('whitespace'); });
    $('#ToBase64Button').click(function () { transformText('base64'); });
    $('#removeSpecialChar').click(function () { transformText('specialChar'); });
    $('#reverseTextButton').click(function () { transformText('reverse'); });
    $('#Alternate').click(function () { transformText('alternate'); });
    $('#CountWord').click(function () { transformText('countword'); });
    $('#CountChar').click(function () { transformText('countchar'); });
    $('#CountLine').click(function () { transformText('countline'); });
    $('#CountSpace').click(function () { transformText('countspace'); });
    $('#Removenewline').click(function () { transformText('removenewline'); });
    $('#ReplaceWord').click(function () {
        transformText('replaceword');
    });

    //copy from clipboard
    $('#copyToClipboardButton').click(function () {
        var text = $('#floatingTextarea2').val();
        if (text === '') {
            alert('Please enter the text to copy.');
        } else {
            navigator.clipboard.writeText(text).then(function () {
                $('#floatingTextarea3').val('Text copied successfully!');
            }).catch(function (err) {
                console.error('Failed to copy text: ', err);
            });
        }
    });

    //paste from clipboard
    $('#pasteFromClipboardButton').click(function () {
        navigator.clipboard.readText().then(function (clipboardText) {
            if ($('#floatingTextarea3').val() === 'Text copied successfully!') {
                $('#floatingTextarea3').val('');
                $('#floatingTextarea3').val(clipboardText);
            } else {
                $('#floatingTextarea3').val($('#floatingTextarea3').val() + ' ' + clipboardText);
            }
        }).catch(function (err) {
            console.error('Failed to paste from clipboard: ', err);
        });
    });


    //clear
    $('#clearTextButton').click(function () {
        if ($('#display-img').css('display') != 'none') {
            if (confirm('Are you sure?')) {
                $('#imageUploadInput').val('');
                $('#display-img').html('');
                $('#display-img').hide();
                $('.answer-box').val('').css('height', '100px');
                $('#floatingTextarea2').show();
                updateSwapButtonVisibility();
            }
        }
        else {
            if ($('#floatingTextarea2').val() === '') {
                alert('Please enter text.');
                return;
            }
            if (confirm('Are you sure you want to clear all text?')) {
                $('#floatingTextarea2').val('');
                $('.answer-box').val('');
                updateSwapButtonVisibility();
            }
        }
        updateSwapButtonVisibility();
    });

});