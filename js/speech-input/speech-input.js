/* global webkitSpeechRecognition
* inspired from https://github.com/Daniel-Hug/speech-input
*/

(function( $ ) {

  $.fn.speechInput = function(options) {
    if (!('webkitSpeechRecognition' in window)) {
      console.log("SpeechRecognition is not supported!");
      return this;
    }
    var opts = $.extend( {}, $.fn.speechInput.defaults, options );
    return this.each(function(index, element) {
      $.fn.speechInput.init(element, opts);
    });
  };

  // Plugin defaults – added as a property on our plugin function.
  $.fn.speechInput.defaults = {
    talkMsg: "Speak now",
    buttonSize: 26,
    patienceThreshold: 6,
    lang: "fr-FR"
  };

  $.fn.speechInput.capitalize = function(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  $.fn.speechInput.init = function(inputEl, options){
    var talkMsg = options.talkMsg;
  	var defaultPatienceThreshold = options.patienceThreshold;

    var patience = parseInt(inputEl.dataset.patience, 10) || defaultPatienceThreshold;
    var micBtn, micIcon, holderIcon, newWrapper;
    var shouldCapitalize = true;

    // gather inputEl data
    var nextNode = inputEl.nextSibling;
    var parent = inputEl.parentNode;
    var inputRightBorder = parseInt(getComputedStyle(inputEl).borderRightWidth, 10);
    var buttonSize = 0.8 * (inputEl.dataset.buttonsize || inputEl.offsetHeight || options.buttonSize);

    // default max size for textareas
    if (!inputEl.dataset.buttonsize && inputEl.tagName === 'TEXTAREA' && buttonSize > 26) {
      buttonSize = 26;
    }

    // create wrapper if not present
    var wrapper = inputEl.parentNode;
    if (!wrapper.classList.contains('si-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.classList.add('si-wrapper');
      wrapper.appendChild(parent.removeChild(inputEl));
      newWrapper = true;
    }

    // create mic button if not present
    micBtn = wrapper.querySelector('.si-btn');
    if (!micBtn) {
      micBtn = document.createElement('button');
      micBtn.type = 'button';
      micBtn.classList.add('si-btn');
      micBtn.textContent = 'speech input';
      micIcon = document.createElement('span');
      holderIcon = document.createElement('span');
      micIcon.classList.add('si-mic');
      holderIcon.classList.add('si-holder');
      micBtn.appendChild(micIcon);
      micBtn.appendChild(holderIcon);
      wrapper.appendChild(micBtn);

      // size and position mic and input
      micBtn.style.cursor = 'pointer';
      micBtn.style.top = 0.125 * buttonSize + 'px';
      micBtn.style.height = micBtn.style.width = buttonSize + 'px';
      inputEl.style.paddingRight = buttonSize - inputRightBorder + 'px';
    }

    // append wrapper where input was
    if (newWrapper) parent.insertBefore(wrapper, nextNode);

    // setup recognition
    var prefix = '';
    var isSentence;
    var recognizing = false;
    var timeout;
    var oldPlaceholder = null;
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    // if lang attribute is set on field use that
    // (defaults to use the lang of the root element)
    if (inputEl.lang) {
      recognition.lang = inputEl.lang;
    } else {
      recognition.lang = options.lang;
    }


    function restartTimer() {
      timeout = setTimeout(function() {
        recognition.stop();
      }, patience * 1000);
    }

    recognition.onstart = function() {
      oldPlaceholder = inputEl.placeholder;
      inputEl.placeholder = inputEl.dataset.ready || talkMsg;
      recognizing = true;
      micBtn.classList.add('listening');
      restartTimer();
    };

    recognition.onend = function() {
      recognizing = false;
      clearTimeout(timeout);
      micBtn.classList.remove('listening');
      if (oldPlaceholder !== null) inputEl.placeholder = oldPlaceholder;

      // If the <input> has data-instant-submit and a value,
      if (inputEl.dataset.instantSubmit !== undefined && inputEl.value) {
        // submit the form it's in (if it is in one).
        if (inputEl.form) inputEl.form.submit();
      }
    };

    var finalTranscript = '';
    recognition.onresult = function(event) {
      clearTimeout(timeout);

      // get SpeechRecognitionResultList object
      var resultList = event.results;

      // go through each SpeechRecognitionResult object in the list
      var interimTranscript = '';
      for (var i = event.resultIndex; i < resultList.length; ++i) {
        var result = resultList[i];

        // get this result's first SpeechRecognitionAlternative object
        var firstAlternative = result[0];

        if (result.isFinal) {
          finalTranscript += firstAlternative.transcript;
        } else {
          interimTranscript += firstAlternative.transcript;
        }
      }

      // capitalize transcript if start of new sentence
      var transcript = finalTranscript || interimTranscript;
      transcript = !prefix || isSentence ? $.fn.speechInput.capitalize(transcript) : transcript;

      // append transcript to cached input value
      inputEl.value = prefix + transcript;

      // set cursur and scroll to end
      inputEl.focus();
      if (inputEl.tagName === 'INPUT') {
        inputEl.scrollLeft = inputEl.scrollWidth;
      } else {
        inputEl.scrollTop = inputEl.scrollHeight;
      }

      restartTimer();
    };

    micBtn.addEventListener('click', function(event) {
      event.preventDefault();

      // stop and exit if already going
      if (recognizing) {
        recognition.stop();
        return;
      }

      // Cache current input value which the new transcript will be appended to
      var endsWithWhitespace = inputEl.value.slice(-1).match(/\s/);
      prefix = !inputEl.value || endsWithWhitespace ? inputEl.value : inputEl.value + ' ';

      // check if value ends with a sentence
      isSentence = prefix.trim().slice(-1).match(/[\.\?\!]/);

      // restart recognition
      finalTranscript = '';
      recognition.start();
    }, false);
  };

}( jQuery ));
