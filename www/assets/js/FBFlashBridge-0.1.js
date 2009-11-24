/*
 * fbFlashBridge - Facebook Connect Flash Bridge
 * 
 * Copyright (c) 2009 Pieter Michels
 *
 * @author	Pieter Michels
 *
 */
 
/**
 * @class	Facebook Connect Flash Bridge
 *
 * @author	Pieter Michels
 * @version	0.1
 * @requires	jQuery library (> 1.2.6) 
 *
 * @param	{String}	appName	Application Name
 * @param	{String}	appKey	Application key
 * @param	{String}	appURL	Url to the xd_receiver.htm file
 * @param	{String}	flashObject	Reference to the Flash object
 *
 * @constructor
 */
function FBFlashBridge(appName, appKey, appURL, flashObject) {
	
	// Constructor Variables
	var _sAppName = appName;
	var _sAppURL = appURL;
	var _sAppKey = appKey;
	var _oFlash = flashObject;
	
	// Static (Public) Variables
	this.LOGGED_IN = "LOGGED_IN";
	this.NOT_LOGGED_IN = "NOT_LOGGED_IN";
	this.LOGGED_OUT = "LOGGED_OUT";
	
	// this.CURRENT_STATUS = "CURRENT_STATUS";
	// this.STATUS_SET = "STATUS_SET";
	
	this.STREAM_GET = "STREAM_GET";
	this.STREAM_COMMENTS_GET = "STREAM_COMMENTS_GET";
	
	this.PERMISSIONS_SET = "PERMISSIONS_SET";
	
	this.FRIENDS_GET = "FRIENDS_GET";
	this.APP_USERS = "APP_USERS";
	
	this.USER_INFO = "USER_INFO";
	this.USERS_INFO = "USERS_INFO";
	
	this.EMAIL_SENT = "EMAIL_SENT";
	this.NOTIFICATION_SENT = "NOTIFICATION_SENT";
	this.NOTIFICATIONS_GET = "NOTIFICATIONS_GET";
	
	this.ALBUMS_GET = "ALBUMS_GET";
	this.ALBUM_PHOTOS_GET = "ALBUM_PHOTOS_GET";
	this.ALBUM_CREATE = "ALBUM_CREATE";
	
	// Private Variables
	var _s = this;
	
	var _api;
	
	var _isLoggedIn = false;
	var _isFlashReady = false;
	
	/**
	 * Initialize class
	 */
	function init() {
		trace("Init FBFlashBridge");
		
		FB.init(_sAppKey, _sAppURL);
		
		FB.ensureInit(function() {
			FB.Facebook.get_sessionState().waitUntilReady(function(session) {
				inspect(session);
			
				if(session)
					onLoggedIn();
			});
		})
	}
	
	//*********************************************************//
	
	/**
	 * Log In
	 *
	 * @public
	 */
	function login() {
		trace("Login");
		
		FB.Connect.requireSession(function() {
			trace("LOG IN READY");
			
			onLoggedIn();
		}, true);	
	}
	
		/**
		 *
		 * @private
		 */
		function onLoggedIn() {
			trace("onLoggedIn");
					
			_api = FB.Facebook.apiClient;
		
			if(!_isLoggedIn) {
				_isLoggedIn = true;
	
				dispatchEvent(_s.LOGGED_IN, _api._session);
			}
		}
	
	/**
	 * Log Out
	 *
	 * @public
	 */
	function logout() {
		trace("Log Out");
		
		FB.Connect.logout(function() { 
			trace(_s.LOGGED_OUT);
			
			_isLoggedIn = false;
			
			dispatchEvent(_s.LOGGED_OUT, true);
		});	
	}
	
	/**
	 * Is user logged in?
	 *
	 * @public
	 */
	function isLoggedIn() {
		return _isLoggedIn;
	}
	
	/**
	 * Get current sessions
	 *
	 * @public
	 */
	function getSession() {
		return _api._session;
	}
	
	//*********************************************************//
	
	/**
	 * Ask for permissions
	 *
	 * @param	{String}	permissions	The permission you want to ask, can be more than one (comma separated)
	 *
	 * @public
	 */
	function askPermissions(permissions) {
		trace("Ask Permissions: " + permissions);
		
		FB.ensureInit(function() {
	    	FB.Connect.showPermissionDialog(permissions, function(){
	    		trace(_s.PERMISSIONS_SET);
	    		
	    		dispatchEvent(_s.PERMISSIONS_SET, true);
	    	});
		});
	}
	
	/**
	 * Get all users of the application
	 *
	 * @public
	 */
	function getAppUsers() {
		trace("Get Users of this application");
		
		_api.friends_getAppUsers(function(result, ex) {					
			trace(_s.APP_USERS);
			
			trace(result);
			inspect(result);
			
			if(!$.isArray(result))
				result = [];
				
			dispatchEvent(_s.APP_USERS, result);
		});		
	}
	
	/**
	 * Get friends of the logged in user
	 *
	 * @public
	 */
	function getFriends() {
		trace("Get Friends of logged in user");
		
		_api.friends_get(null, function(result, ex) {					
			trace(_s.FRIENDS_GET);
			
			trace(result);
			inspect(result);
			
			if(!$.isArray(result))
				result = [];
			
			dispatchEvent(_s.FRIENDS_GET, result);
		});		
	}
	
	/**
	 * Get info of array of users (can contain 1 element)
	 *
	 * @param	{Array}	uids 	List of uids you want to access
	 * @param	{Array}	fields	List of fields
	 *
	 * @public
	 */
	function getUsersInfo(uids, fields) {
		trace("Get users info for " + uids);
		
		getGenericUsersInfo(uids, fields, function(result){
			trace(_s.USERS_INFO);		
			
			trace(result);			
			inspect(result);

			dispatchEvent(_s.USERS_INFO, result);
		});
	}
	
	/**
	 * Get info of the logged in user
	 *
	 * @param	{Array}	fields	List of fields
	 *
	 * @public
	 */
	function getUserInfo(fields) {
		trace("Get user info for logged in user");
		
		getGenericUsersInfo([_api._session.uid], fields, function(result){
			trace(_s.USER_INFO);		
			
			trace(result[0]);			
			inspect(result[0]);

			dispatchEvent(_s.USER_INFO, result[0]);
		});
	}
	
		/**
		 *
		 * @private
		 */
		function getGenericUsersInfo(uids, fields, callback) {
			if(!fields)
				fields = ["uid", "pic_square", "first_name", "last_name", "about_me", "sex", "name", "proxied_email"]; // Default array of props
				
			_api.users_getInfo(uids, fields, function(result, ex) {	
				callback(result);
			});
		}
		
	//*********************************************************//
	
	/**
	 * Send e-mail to recipients.
	 *
	 * @param	{String}	recipients	Comma separated list of user ids
	 * @param	{String}	subject	The subject
	 * @param	{String}	text	The e-mail message
	 * @param	{String}	fbml	FBML included in e-mail
	 *
	 * @public
	 */	
	function sendEmail(recipients, subject, text, fbml) {
		trace("Send Email to '" + recipients + "': '" + subject + "', '" + text + "', '" + fbml + "'");
		
		_api.notifications_send(recipients, subject, text, fbml, function(result, ex) {
			trace(_s.EMAIL_SENT);
			
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.EMAIL_SENT, true);
		}); 
	}
	
	/**
	 * Send notification to an arrays of uids. Notification can contain html.
	 *
	 * @param	{String}	to_ids	List of user ids
	 * @param	{String}	notification	Notification message
	 *
	 * @public
	 */
	function sendNotification(to_ids, notification) {
		trace("Send Notification to '" + to_ids + "': '" + notification + "'");
		
		_api.notifications_send(to_ids, notification, function(result, ex) {
			trace(_s.NOTIFICATION_SENT);
			
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.NOTIFICATION_SENT, true);
		}); 
	}
	
	/**
	 * Get all notification messages of current user (includes group invites, event invites, ...)
	 *
	 * @public
	 */
	function getNotifications() {
		trace("Get notifications of logged in user");
		
		_api.notifications_get(function(result){
			trace(_s.NOTIFICATIONS_GET);
			
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.NOTIFICATIONS_GET, result);
		});
	}

	//*********************************************************//

	/**
	 * Get albums for a user or logged in user (if left blank)
	 *
	 * @param	{String}	uid	User id
	 *
	 * @public
	 */
	function getAlbums(uid) {
		trace("Get albums of " + uid);
		
		_api.photos_getAlbums(uid, '', function(result) {
			trace(_s.ALBUMS_GET);
	
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.ALBUMS_GET, result);
		});
	}
	
	/**
	 * Get all photos for a given album (albumid)
	 *
	 * @param	{String}	albumId	Album id
	 *
	 * @public
	 */
	function getAlbumPhotos(albumId) {
		trace("Get photos of albums " + albumId);
		
		_api.photos_get(null, albumId, null, function(result) {
			trace(_s.ALBUM_PHOTOS_GET);
	
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.ALBUM_PHOTOS_GET, true);
		});	
	}
	
	/**
	 * Create album for the current user
	 *
	 * @param	{String}	name	Name of album
	 * @param	{String}	location	Location of album
	 * @param	{String}	description	Description of album
	 *
	 * @public
	 */
	function createAlbum(name, location, description) {
		trace("CREATE ALBUM WITH NAME: '" + name + "', LOCATION: '" + location + "', DESCR: '" + description + "'");
		
		_api.photos_createAlbum(name, location, description, function(result) {
			trace(_s.ALBUM_CREATE);
	
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.ALBUM_CREATE, result);
		});	
	}
	
	//*********************************************************//

	/**
	 * Publish something to the wall of the current logged in user or to the target user (target_id)
	 *
	 * @public
	 */
	function publish(user_message, attachment, action_links, target_id, user_message_prompt) {
		/*var attach = {
				'name':'Go grab your free bundle right now!',
				'href':'http://www.macheist.com/nano/facebook',
				'caption':'Download full copies of six top Mac apps normally costing over $150 totally for free at MacHeist!',
				'description':"There’s something for everyone, whether you’re a gamer, a student, a writer, a twitter addict, or just love Mac apps. Plus as a Facebook user you can also get VirusBarrier X5 ($70) as a bonus. Don’t miss out!",
				'media':[{'type':'image','src':'http://www.macheist.com/static/facebook/facebook_mh.png','href':'http://www.macheist.com/nano/facebook'}]
			}
		*/	
		FB.Connect.streamPublish(user_message, attachment, action_links, target_id, user_message_prompt, function(result, ex) {
			trace(result);
			trace(ex);
		});
	}
	
	/**
	 * Get stream of a user (uid)
	 *
	 * @param	{String}	uid	User id
	 *
	 * @public
	 */
	function getStream(uid) {
		trace("Get Stream of " + uid);
		
		_api.stream_get(uid, '', '', '', '', function(result) {
			trace(_s.STREAM_GET);
	
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.STREAM_GET, result);
		});
	}
	
	/**
	 * Get comments of a streal story (post_id)
	 *
	 * @param	{String}	post_id	Post id
	 *
	 * @public
	 */
	function getStreamComments(post_id) {
		trace("Get comments of stream with post_id " + post_id);
		
		_api.stream_getComments(post_id, function(result) {
			trace(_s.STREAM_COMMENTS_GET);
	
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.STREAM_COMMENTS_GET, result);
		});	
	}
	
	/** 
	 * DEPECRATED
	 *
	function getStatus(uid, limit) {
		trace("Get Status");
		
		_api.status_get(uid, limit, function(result, ex) {
			trace("CURRENT_STATUS");
			
			trace(result);
			
			dispatchEvent(_s.CURRENT_STATUS, result);
		});		
	}
	
	function setStatus(status) {
		trace("Set status to '" + status + "'");

		// FB.Connect.streamPublish(status);

		_api.users_setStatus(status, false, false, function() {
			trace("STATUS_SET");
			
			dispatchEvent(_s.STATUS_SET, true);
		});
	}
	*/
	
	//*********************************************************//
	
	/**
	 * Only called from Flash
	 */
	function onFlashLoaded() {
		trace("onFlashLoaded (from Flash)");
		
		_isFlashReady = true;
	}
	
	/**
	 * Check logged in status for first call in Flash
	 */
	function checkLogin() {
		trace("checkLogin (from Flash)");
		
		if(_isLoggedIn) { // Notify Flash when FB User is logged in
			trace("FB user logged in.");

			dispatchEvent(_s.LOGGED_IN, this.getSession());
		} else {
			trace("FB user NOT logged in.");
			
			dispatchEvent(_s.NOT_LOGGED_IN, true);
		}
	}
	
	//*********************************************************//
	
	/**
	 * Dispatch Event
	 *
	 * @example	<br />Usage: dispatchEvent("flashFunction", parameter);
	 *
	 * @param	{String}	eventType	Type of event
	 * @param	{String}	data	Data passed as arguments to the functions that are listening
	 *
	 * @public
	 */
	function dispatchEvent(eventType, data) {
		dispatchFlashEvent("handleJSCall", eventType, data);
		
		$(document).trigger(eventType, data);
	}
	
	/**
	 * Listen for event
	 *
	 * @param	{String}	eventType	Type of event you are listening to
	 * @param	{String}	func	Function that will be triggered when the event is fired
	 *
	 * @public
	 */
	function addEventListener(eventType, func) {
		$(document).bind(eventType, function(e, data) { func(data); });
	}
	
	/**
	 * Dispatch Event to Flash Object. 
	 *
	 * @example	<br />Usage: dispatchFlashEvent("flashFunction", parameter1, parameter2, ...);
	 *
	 * @param	{String}	func	Function to call in flash. Arguments can be passed as well as extra parameters
	 *
	 * @public
	 */
	function dispatchFlashEvent(func) {
		var args = Array.prototype.slice.call(arguments).slice(1);
		
		trace("DFE: " + JSON.stringify(args));
		
		if(_oFlash && _isFlashReady) {
			if(arguments.length > 1)
				_oFlash[func](args);
			else
				_oFlash[func]();
		}
	}
	
	//*********************************************************//
	
	// Init Public Methods
	this.init = init;
	this.login = login;
	this.logout = logout;
	this.isLoggedIn = isLoggedIn;
	
	this.sendEmail = sendEmail;
	this.sendNotification = sendNotification;
	this.getNotifications = getNotifications;
	
	this.getAlbums = getAlbums;
	this.getAlbumPhotos = getAlbumPhotos;
	this.createAlbum = createAlbum;
	
	this.publish = publish;
	this.getStream = getStream;
	this.getStreamComments = getStreamComments;
	
	this.askPermissions = askPermissions;
	this.getAppUsers = getAppUsers;
	this.getFriends = getFriends;
	this.getUsersInfo = getUsersInfo;
	this.getUserInfo = getUserInfo;
	
	this.getSession = getSession;
	
	this.onFlashLoaded = onFlashLoaded;
	this.checkLogin = checkLogin;
	
	this.dispatchEvent = dispatchEvent;
	this.addEventListener = addEventListener;
	this.dispatchFlashEvent = dispatchFlashEvent;
}

//***********************************************************************************************************//

if(!("console" in window) || !("firebug" in console)) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};

    for(var i = 0; i < names.length; ++i) window.console[names[i]] = function() {};
}

function trace(msg) {
	// alert(msg);
	
	if(console)	
		console.debug(msg);
}

function inspect(obj) {
	if(console)	
		console.dir(obj);
}
