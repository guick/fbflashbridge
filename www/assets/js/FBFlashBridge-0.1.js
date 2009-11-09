/*
 * fbFlashBridge - Facebook Connect Flash Bridge
 * 
 * Copyright (c) 2009 Pieter Michels
 *
 */
 
function FBFlashBridge(appName, appKey, appURL, flashObject) {
	
	// Constructor Variables
	var _sAppName = appName;
	var _sAppURL = appURL;
	var _sAppKey = appKey;
	var _oFlash = flashObject;
	
	// Static (Public) Variables
	this.LOGGED_IN = "LOGGED_IN";
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
	
	// Private Variables
	var _s = this;
	
	var _api;
	
	var _friendResult;
	var _userResult;
	var _usersResult;
	
	var _isLoggedIn = false;
	var _isFlashReady = false;
	
	/**
	 * Initialize class
	 * 
	 * Private
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
	 * Public
	 */
	function login() {
		trace("Login");
		
		FB.Connect.requireSession(function() {
			trace("LOG IN READY");
			
			onLoggedIn();
		}, true);	
	}
	
		function onLoggedIn() {
			trace("onLoggedIn");
					
			_api = FB.Facebook.apiClient;
		
			if(!_isLoggedIn) {
				_isLoggedIn = true;
	
				dispatchEvent(_s.LOGGED_IN);
				dispatchFlashEvent("onLoggedIn", _api._session);
			}
		}
	
	/**
	 * Log Out
	 *
	 * Public
	 */
	function logout() {
		trace("Log Out");
		
		FB.Connect.logout(function() { 
			trace(_s.LOGGED_OUT);
			
			_isLoggedIn = false;
			
			dispatchEvent(_s.LOGGED_OUT);
			dispatchFlashEvent("onLoggedOut");
		});	
	}
	
	/**
	 * Is user logged in?
	 *
	 * Public
	 */
	function isLoggedIn() {
		return _isLoggedIn;
	}
	
	//*********************************************************//
	
	/**
	 * Ask for permissions
	 *
	 * Public
	 */
	function askPermissions(permissions) {
		trace("Ask Permissions: " + permissions);
		
		FB.ensureInit(function() {
	    	FB.Connect.showPermissionDialog(permissions, function(){
	    		trace(_s.PERMISSIONS_SET);
	    		
	    		dispatchEvent(_s.PERMISSIONS_SET);
				dispatchFlashEvent("onPermissionsSet");
	    	});
		});
	}
	
	/**
	 * Get all users of the application
	 *
	 * Public
	 */
	function getAppUsers() {
		trace("Get Users of this application");
		
		_api.friends_getAppUsers(function(result, ex) {					
			trace(_s.APP_USERS);
			
			trace(result);
			inspect(result);
			
			if(!$.isArray(result))
				result = [];
				
			dispatchEvent(_s.APP_USERS);
			dispatchFlashEvent("onAppUsers", result);
		});		
	}
	
	/**
	 * Get friends of the logged in user
	 *
	 * Public
	 */
	function getFriends() {
		trace("Get Friends of logged in user");
		
		_api.friends_get(null, function(result, ex) {					
			trace(_s.FRIENDS_GET);
			
			trace(result);
			inspect(result);
			
			if(!$.isArray(result))
				result = [];
			
			dispatchEvent(_s.FRIENDS_GET);
			dispatchFlashEvent("onFriendsList", result);
		});		
	}
	
	/**
	 * Get info of array of users (can contain 1 element)
	 *
	 * Public
	 */
	function getUsersInfo(uids, fields) {
		trace("Get users info for " + uids);
		
		getGenericUsersInfo(uids, fields, function(result){
			trace(_s.USERS_INFO);		
			
			trace(result);			
			inspect(result);

			dispatchEvent(_s.USERS_INFO);
			dispatchFlashEvent("onUsersInfo", result);
		});
	}
	
	/**
	 * Get info of the logged in user
	 *
	 * Public
	 */
	function getUserInfo(fields) {
		trace("Get user info for logged in user");
		
		getGenericUsersInfo([_api._session.uid], fields, function(result){
			trace(_s.USER_INFO);		
			
			trace(result[0]);			
			inspect(result[0]);

			dispatchEvent(_s.USER_INFO);
			dispatchFlashEvent("onUserInfo", result[0]);
		});
	}
	
		function getGenericUsersInfo(uids, fields, callback) {
			if(!fields)
				fields = ["uid", "pic_square", "first_name", "last_name", "about_me", "sex", "name", "proxied_email"]; // Default array of props
				
			_api.users_getInfo(uids, fields, function(result, ex) {	
				callback(result);
			});
		}
		
	//*********************************************************//
		
	function sendEmail(recipients, subject, text, fbml) {
		trace("Send Email to '" + recipients + "': '" + subject + "', '" + text + "', '" + fbml + "'");
		
		_api.notifications_send(recipients, subject, text, fbml, function(result, ex) {
			trace(_s.EMAIL_SENT);
			
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.EMAIL_SENT);
			dispatchFlashEvent("onEmailSent");
		}); 
	}
	
	function sendNotification(to_ids, notification) {
		trace("Send Notification to '" + to_ids + "': '" + notification + "'");
		
		_api.notifications_send(to_ids, notification, function(result, ex) {
			trace(_s.NOTIFICATION_SENT);
			
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.NOTIFICATION_SENT);
			dispatchFlashEvent("onNotificationSent");
		}); 
	}
	
	function getNotifications() {
		trace("Get notifications of logged in user");
		
		_api.notifications_get(function(result){
			trace(_s.NOTIFICATIONS_GET);
			
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.NOTIFICATIONS_GET);
			dispatchFlashEvent("onNotificationGet", result);
		});
	}

	//*********************************************************//
	
	function getAlbums() {
	
	}
	
	function getPhotosFromAlbum() {
	
	}
	
	function createAlbum() {
	
	}
	
	//*********************************************************//

	/**
	 * Publish something to the wall of the current logged in user or to the target user (target_id)
	 *
	 * Public
	 */
	function publish(user_message, attachment, action_links, target_id, user_message_prompt) {
		FB.Connect.streamPublish(user_message, attachment, action_links, target_id, user_message_prompt, function(result, ex) {
			trace(result);
			trace(ex);
		});
	}
	
	/**
	 * Get stream of a user (uid)
	 *
	 * Public
	 */
	function getStream(uid) {
		trace("Get Stream of " + uid);
		
		_api.stream_get(uid, '', '', '', '', function(result) {
			trace(_s.STREAM_GET);
	
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.STREAM_GET);
			dispatchFlashEvent("onStreamGet", result);
		});
	}
	
	/**
	 * Get comments of a streal story (post_id)
	 *
	 * Public
	 */
	function getStreamComments(post_id) {
		trace("Get comments of stream with post_id " + post_id);
		
		_api.stream_getComments(post_id, function(result) {
			trace(_s.STREAM_COMMENTS_GET);
	
			trace(result);
			inspect(result);
			
			dispatchEvent(_s.STREAM_COMMENTS_GET);
			dispatchFlashEvent("onStreamCommentsGet", result);
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
			
			dispatchEvent(_s.CURRENT_STATUS);
			dispatchFlashEvent("onCurrentStatus", result);
		});		
	}
	
	function setStatus(status) {
		trace("Set status to '" + status + "'");

		// FB.Connect.streamPublish(status);

		_api.users_setStatus(status, false, false, function() {
			trace("STATUS_SET");
			
			dispatchEvent(_s.STATUS_SET);
			dispatchFlashEvent("onStatusSet");
		});
	}
	*/
	
	//*********************************************************//
	
	function onFlashLoaded() {
		trace("onFlashLoaded");
		
		_isFlashReady = true;
		
		if(_isLoggedIn) { // Notify Flash when FB User is logged in
			trace("FB user logged in.");
			
			dispatchFlashEvent("onLoggedIn", api._session);
		}
	}
	
	//*********************************************************//
	
	/**
	 * Dispatch Event
	 *
	 * Public
	 */
	function dispatchEvent(eventType, data) {
		$(document).trigger(eventType, data);
	}
	
	/**
	 * Listen for event
	 *
	 * Public
	 */
	function addEventListener(eventType, func) {
		$(document).bind(eventType, function(e, data) { func(data); });
	}
	
	/**
	 * Dispatch Event to Flash Object
	 *
	 * Public
	 */
	function dispatchFlashEvent(func) {
		if(_oFlash && _isFlashReady) {
			if(arguments.length > 1)
				_oFlash[func](Array.prototype.slice.call(arguments).slice(1)[0]);
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
	this.getPhotosFromAlbum = getPhotosFromAlbum;
	this.createAlbum = createAlbum;
	
	this.publish = publish;
	this.getStream = getStream;
	this.getStreamComments = getStreamComments;
	
	this.askPermissions = askPermissions;
	this.getAppUsers = getAppUsers;
	this.getFriends = getFriends;
	this.getUsersInfo = getUsersInfo;
	this.getUserInfo = getUserInfo;
	
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


/*

function FBFlashBridgeGetAlbums(userId) {
	trace("GET ALBUMS OF " + userId);
	
	api.photos_getAlbums(userId, null, function(result) {
		trace("ALBUMS_GET");

		trace(result);
		
		FBFlashBridgeDispatcher("ALBUMS_GET");
		
		FBFlashBridgeFlashDispatcher("onAlbumsGet", result);
	});
}

function FBFlashBridgeCreateAlbum(name, location, description) {
	trace("CREATE ALBUM WITH NAME: '" + name + "', LOCATION: '" + location + "', DESCR: '" + description + "'");
	
	api.photos_createAlbum(name, location, description, function(result) {
		trace("ALBUM_CREATE");

		trace(result);
		
		FBFlashBridgeDispatcher("ALBUM_CREATE");
		
		FBFlashBridgeFlashDispatcher("onAlbumCreated", result);
	});
}

function FBFlashBridgeGetPhotosInAlbum(albumId) {
	trace("GET PHOTOS OF ALBUMS " + albumId);
	
	api.photos_get(null, albumId, null, function(result) {
		trace("PHOTOS_ALBUM_GET");

		trace(result);
		
		FBFlashBridgeDispatcher("PHOTOS_ALBUM_GET");
		
		FBFlashBridgeFlashDispatcher("onPhotosOfAlbumGet", result);
	});
}


*/