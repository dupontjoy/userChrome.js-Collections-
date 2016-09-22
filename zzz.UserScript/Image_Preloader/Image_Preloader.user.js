// ==UserScript==
// @name        Image_Preloader
// @namespace   https://github.com/DimitarChristoff/pre-loader
// @description Preload images
// @include     *
// @version     0.5.0
// @grant       none
// ==/UserScript==

;(function(){
	'use strict';

	// can we support addEventListener
	var hasNative = 'addEventListener' in (new Image());

	/**
	 * @constructor
	 * @param {Array} images - string of images to load
	 * @param {Object=} options - overrides to defaults
	 */
	var PreLoader = function(images, options){
		this.options = {
			pipeline: false,
			auto: true,
			prefetch: false,
			/* onProgress: function(){}, */
			/* onError: function(){}, */
			onComplete: function(){}
		};

		options && typeof options == 'object' && this.setOptions(options);

		this.addQueue(images);
		this.queue.length && this.options.auto && this.processQueue();
	};

	/**
	 * naive shallow copy/reference from options into proto options
	 * @param {Object} options
	 * @returns {PreLoader}
	 */
	PreLoader.prototype.setOptions = function(options){
		// shallow copy
		var o = this.options,
			key;

		for (key in options) options.hasOwnProperty(key) && (o[key] = options[key]);

		return this;
	};

	/**
	 * stores a local array, dereferenced from original
	 * @param images
	 * @returns {PreLoader}
	 */
	PreLoader.prototype.addQueue = function(images){
		this.queue = images.slice();

		return this;
	};

	/**
	 * reset the arrays
	 * @returns {PreLoader}
	 */
	PreLoader.prototype.reset = function(){
		this.completed = [];
		this.errors = [];

		return this;
	};

	/**
	 * Subscribe to events for an imag object and a source
	 * @param {Object} image
	 * @param {String} src
	 * @param {Number} index
	 * @returns {PreLoader}
	 * @private
	 */
	PreLoader.prototype._addEvents = function(image, src, index){
		var self = this,
			o = this.options,
			cleanup = function(){
				if (hasNative){
					this.removeEventListener('error', abort);
					this.removeEventListener('abort', abort);
					this.removeEventListener('load', load);
				}
				else {
					this.onerror = this.onabort = this.onload = null;
				}
			},
			abort = function(){
				cleanup.call(this);

				self.errors.push(src);
				o.onError && o.onError.call(self, src);
				_checkProgress.call(self, src);
				o.pipeline && self._loadNext(index);
			},
			load = function(){
				cleanup.call(this);

				// store progress. this === image
				self.completed.push(src); // this.src may differ
				_checkProgress.call(self, src, this);
				o.pipeline && self._loadNext(index);
			};

		if (hasNative){
			image.addEventListener('error', abort, false);
			image.addEventListener('abort', abort, false);
			image.addEventListener('load', load, false);
		}
		else {
			image.onerror = image.onabort = abort;
			image.onload = load;
		}

		return this;
	};

	/**
	 * Private API to load an image
	 * @param {String} src
	 * @param {Number} index
	 * @returns {PreLoader}
	 * @private
	 */
	PreLoader.prototype._load = function(src, index){
		/*jshint -W058 */
		var image = new Image;

		this._addEvents(image, src, index);

		// actually load
		image.src = src;

		return this;
	};

	/**
	 * Move up the queue index
	 * @param {Number} index
	 * @returns {PreLoader}
	 * @private
	 */
	PreLoader.prototype._loadNext = function(index){
		// when pipeline loading is enabled, calls next item
		index++;
		this.queue[index] && this._load(this.queue[index], index);

		return this;
	};

	/**
	 * Iterates through the queue of images to load
	 * @returns {PreLoader}
	 */
	PreLoader.prototype.processQueue = function(){
		// runs through all queued items.
		var i = 0,
			queue = this.queue,
			len = queue.length;

		// process all queue items
		this.reset();

		if (!this.options.pipeline) for (; i < len; ++i) this._load(queue[i], i);
		else this._load(queue[0], 0);

		return this;
	};

	/*jshint validthis:true */
	/**
	 * Internal checker on the queue progress
	 * @param {String} src
	 * @param {Object} image
	 * @returns {PreLoader}
	 * @private
	 */
	function _checkProgress(src, image){
		// intermediate checker for queue remaining. not exported.
		// called on preLoader instance as scope
		var args = [],
			o = this.options;

		// call onProgress
		o.onProgress && src && o.onProgress.call(this, src, image, this.completed.length);

		if (this.completed.length + this.errors.length === this.queue.length){
			args.push(this.completed);
			this.errors.length && args.push(this.errors);
			o.onComplete.apply(this, args);
		}

		return this;
	}
	/*jshint validthis:false */

	/**
	 * Static method that loads images lazily from DOM based upon data-preload attribute
	 * @param {Object} options= optional options to pass to PreLoader
	 * @returns {PreLoader} instance
	 */
	PreLoader.lazyLoad = function(options){
		if (!options)
			options = {};

		var lazyImages = document.querySelectorAll(options.selector || 'img[data-preload]'),
			i = 0,
			l = lazyImages.length,
			toLoad = [],
			oldProgress;

		for (; i < l; i++) toLoad.push(lazyImages[i].getAttribute('data-preload'));

		options.onProgress && (oldProgress = options.onProgress);
		options.onProgress = function(item, imgEl, index){
			lazyImages[index-1].src = item;
			lazyImages[index-1].removeAttribute('data-preload');
			oldProgress && oldProgress.apply(this, arguments);
		};

		return toLoad.length ? new PreLoader(toLoad, options) : null;
	};

	if (typeof define === 'function' && define.amd){
		// we have an AMD loader.
		define(function(){
			return PreLoader;
		});
	}
	else {
		this.preLoader = PreLoader;
	}
}).call(this);