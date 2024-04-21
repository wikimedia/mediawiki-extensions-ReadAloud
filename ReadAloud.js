window.ReadAloud = {

	/**
	 * Initialization script
	 */
	init: function () {
		ReadAloud.bind();

		// Stop any running voice
		window.speechSynthesis.cancel();
	},

	/**
	 * Bind events
	 */
	bind: function () {
		$( '#ca-read-aloud' ).on( 'click', ReadAloud.readAloud );
		$( '#ca-pause-reading' ).on( 'click', ReadAloud.pauseReading );
	},

	/**
	 * Read the current page aloud
	 */
	readAloud: function () {

		// Swap buttons
		$( this ).hide();
		$( '#ca-pause-reading' ).show();

		// If speech was paused, just resume
		if ( window.speechSynthesis.paused ) {
			window.speechSynthesis.resume();
			return;
		}

		// Only read selected elements
		var $content = $( '#mw-content-text .mw-parser-output' );
		var $elements = $content.children( 'h1, h2, h3, h4, h5, h6, p, ul, ol' );
		$elements.addClass( 'read' ).on( 'click', ReadAloud.jumpToElement );
		ReadAloud.readNextElement();
	},

	index: 0,
	readNextElement: function () {
		var $element = $( '.read' ).eq( ReadAloud.index );
		ReadAloud.index++;
		$( '.reading' ).removeClass( 'reading' );
		$element.addClass( 'reading' );
		var text = $element.text();
		text = text.replace( / ([A-Z])\./g, ' $1' ); // Remove dots from acronyms to prevent confusion with sentences
		text = text.replace( /[([].*?[\])]/g, '' ); // Don't read parentheses
		var sentences = text.split( '. ' ); // Include space to prevent matching things like "99.9%"
		sentences = sentences.filter( function ( s ) {
			return !!s; // Remove empty sentences
		} );
		ReadAloud.sentences = sentences;
		ReadAloud.readNextSentence();
	},

	sentences: [],
	readNextSentence: function () {
		var sentence = ReadAloud.sentences.shift();
		var utterance = new window.SpeechSynthesisUtterance( sentence );
		utterance.lang = mw.config.get( 'wgPageContentLanguage' );
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak( utterance );
		utterance.onend = ReadAloud.onUtteranceEnd;
	},

	/**
	 * @note This will fire not only when the utterance finishes
	 * but also when the speechSynthesis is cancelled
	 * notably when jumping to another element
	 * This is why we need the ugly skipNextSentence hack seen below
	 */
	onUtteranceEnd: function () {
		if ( ReadAloud.skipNextSentence ) {
			ReadAloud.skipNextSentence = false;
			return;
		}
		if ( ReadAloud.sentences.length ) {
			ReadAloud.nextSentenceTimeout = setTimeout( ReadAloud.readNextSentence, 500 );
			return;
		}
		if ( ReadAloud.index < $( '.read' ).length ) {
			ReadAloud.nextElementTimeout = setTimeout( ReadAloud.readNextElement, 1000 );
			return;
		}
	},

	/**
	 * Jump to a specific element
	 */
	nextElementTimeout: null,
	nextSentenceTimeout: null,
	jumpToElement: function () {
		var $element = $( this );
		var index = $( '.read' ).index( $element );
		ReadAloud.index = index;
		ReadAloud.skipNextSentence = true;
		ReadAloud.readNextElement();
	},

	/**
	 * Pause reading aloud
	 */
	pauseReading: function () {
		// Swap buttons
		$( this ).hide();
		$( '#ca-read-aloud' ).show();

		// Pause reading
		window.speechSynthesis.pause();
	}
};

$( ReadAloud.init );
