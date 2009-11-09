/*
 * fbFlashBridge - Facebook Connect Flash Bridge
 * 
 * Copyright (c) 2009 Pieter Michels
 *
 * ---------------------------------------------
 *
 * Custom javascript calls
 * 
 * FBFlashBridgeLogIn
 * FBFlashBridgeLogOut
 * FBFlashBridgeSetStatus
 * FBFlashBridgeGetCurrentStatus
 * FBFlashBridgeGetFriendsList
 * FBFlashBridgeGetUsersInfo
 * FBFlashBridgePromptPermission
 * FBFlashBridgePublishFeedStory
 * FBFlashBridgeShowShare
 * FBFlashBridgeUserInfo
 * FBFlashBridgeInviteFriends
 * FBFlashBridgeGetStream
 * FBFlashBridgeGetAppUsers
 * FBFlashBridgeSendNotification
 * FBFlashBridgeSendEMail
 * FBFlashBridgeGetAlbums
 * FBFlashBridgeGetPhotosInAlbum
 * FBFlashBridgeCreateAlbum
 * FBFlashBridgeGetStreamComments
 *
 *
 * Custom event listening
 *
 * FBFlashBridgeListener("LOGGED_IN", onLoggedIn); 
 * FBFlashBridgeListener("LOGGED_OUT", onLoggedOut); 
 * FBFlashBridgeListener("STATUS_SET", onStatusSet); 
 * FBFlashBridgeListener("FRIENDS_LIST", onFriendsList); 
 * FBFlashBridgeListener("USERS_INFO", onUsersInfo);
 * FBFlashBridgeListener("USER_INFO", onUserInfo);
 * FBFlashBridgeListener("APP_USERS", onUserInfo);
 * FBFlashBridgeListener("STREAM_GET", onStreamGet);
 * ALBUMS_GET
 * PHOTOS_ALBUM_GET
 * ALBUM_CREATE
 * STREAM_COMMENTS_GET
 *
 */

var sAppName = "";
var sAppURL = "";
var sAppKey = "";

var api;
var friendResult;
var userResult;
var usersResult;
var oFlash = null;
var isFlashReady = false;
var isLoggedIn = false;

//***********************************************************************************************************//

function FBFlashBridgeInviteFriends(title, actionTitle, messageCopy) {
	trace("INVITE FRIENDS");

	// FB.Connect.inviteConnectUsers(); doesn't work
	FB.ensureInit(function()  {
        var dialog = new FB.UI.FBMLPopupDialog(title, "");
        var fbml = "<fb:fbml>" + 
        				"<fb:request-form " + 
        							"method=\"GET\" " +
        							"action=\"" + "http://stream.microsite.be/cecemel/index.html" + "\" " + 
        							"invite=\"false\" " + 
      								"type=\"" + sAppName + "\" " + 
       								"content=\"" + messageCopy + " " +        										
    	   									"<fb:req-choice url='http://stream.microsite.be/cecemel' label='Confirm' />\"" + 
    	   							">" + 
  							"<fb:multi-friend-selector showborder=\"false\" exclude_ids=\"\" actiontext=\"" + actionTitle + "\" rows=\"5\" bypass=\"cancel\" showborder=\"true\" />" + 
        				"</fb:request-form>" + 
        			"</fb:fbml>";
        /*
        var fbml = "<fb:fbml>" + 
        				"<fb:iframe " +  
        						"src=\"http://stream.microsite.be/cecemel/assets/popup/invite.html?fb_force_mode=fbml&sAppName=" + sAppName + "&actionTitle=" + actionTitle + "&messageCopy=" + messageCopy + "\"" + 
        						"smartsize=\"true\" " + 
        						">" +  
        				"</fb:iframe>" + 
        			"</fb:fbml>";
        */
        dialog.setFBMLContent(fbml);
        dialog.setContentWidth(630); 
        dialog.setContentHeight(500);
        
        dialog.show();
    });
}

//***********************************************************************************************************//

function FBFlashBridgeSetStatus(status) {
	trace("SETTING STATUS (" + status + ")");

	api.users_setStatus(status, false, false, function() {
		trace("STATUS_SET");
		
		FBFlashBridgeDispatcher("STATUS_SET");
		
		FBFlashBridgeFlashDispatcher("onStatusSet");
	});
}

function FBFlashBridgeGetCurrentStatus(userId, limit) {
	api.status_get(userId, limit, function(result, ex) {
		trace(result);
		
		trace("CURRENT_STATUS");
		
		FBFlashBridgeDispatcher("CURRENT_STATUS");
		
		FBFlashBridgeFlashDispatcher("onCurrentStatus", result);
	});
}

//***********************************************************************************************************//

function FBFlashBridgeUserInfo(userId, arrProfileData) {
	trace("GETTING USER INFO OF LOGGED IN USER OR USER WITH GIVEN UID (" + userId + " or " + api._session.uid + ")");

	// ["timezone", "status", "sex", "proxied_email", "profile_url", "pic_square_with_logo", "pic_square", "pic_small_with_logo", "pic_small", "pic_big_with_logo", "pic_big", "pic_with_logo", "pic", "name", "first_name", "last_name", "is_app_user", "hometown_location", "birthday", "about_me", "uid"]
	
	api.users_getInfo([userId > 0 ? userId : api._session.uid], arrProfileData, function(result, ex) {	
		userResult = result[0];

		trace("USER_INFO");
		
		FBFlashBridgeDispatcher("USER_INFO");
		
		FBFlashBridgeFlashDispatcher("onUserInfo", userResult);
	});
}

function FBFlashBridgeGetUsersInfo(arrUsers, arrProfileData) {
	api.users_getInfo(arrUsers, arrProfileData, function(result, ex) {	
		usersResult = result;

		trace("USERS_INFO");
		
		if(!$.isArray(usersResult))
			usersResult = [];
		
		FBFlashBridgeDispatcher("USERS_INFO");
		
		FBFlashBridgeFlashDispatcher("onUsersInfo", usersResult);
	});
}

//***********************************************************************************************************//

function FBFlashBridgeGetFriendsList() {
	api.friends_get(null, function(result, ex) {					
		friendResult = result;
		
		trace("FRIENDS_LIST");
		
		if(!$.isArray(friendResult))
			friendResult = [];
		
		FBFlashBridgeDispatcher("FRIENDS_LIST");
		
		FBFlashBridgeFlashDispatcher("onFriendsList", friendResult);
	});
}

function FBFlashBridgeGetAppUsers() {
	api.friends_getAppUsers(function(result, ex) {					
		usersResult = result;
		
		trace("APP_USERS");
		
		if(!$.isArray(usersResult))
			usersResult = [];
			
		FBFlashBridgeDispatcher("APP_USERS");
		
		FBFlashBridgeFlashDispatcher("onAppUsers", usersResult);
	});
}

//***********************************************************************************************************//

function FBFlashBridgeGetStream(userId) {
	trace("GET STREAM OF " + userId);
	
	api.stream_get(userId, '', '', '', '', function(result) {
		trace("STREAM_GET");

		trace(result.posts[0]);
		
		FBFlashBridgeDispatcher("STREAM_GET");
		
		FBFlashBridgeFlashDispatcher("onStreamGet", result);
	});
}

function FBFlashBridgeGetStreamComments(postId) {
	trace("GET COMMENTS OF STREAM WITH POSTID " + postId);
	
	api.stream_getComments(postId, function(result) {
		trace("STREAM_COMMENTS_GET");

		trace(result);
		
		FBFlashBridgeDispatcher("STREAM_COMMENTS_GET");
		
		FBFlashBridgeFlashDispatcher("onStreamCommentsGet", result);
	});
}

//***********************************************************************************************************//

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

//***********************************************************************************************************//

function FBFlashBridgePromptPermission(permission) {
	FB.ensureInit(function() {
    	FB.Connect.showPermissionDialog(permission);
	});
}

//***********************************************************************************************************//

function FBFlashBridgePublishFeedStory(templateBundleId, templateData) {
	FB.ensureInit(function() {
        FB.Connect.showFeedDialog(parseInt(templateBundleId), templateData, null, null, FB.FeedStorySize.shortStory, FB.RequireConnect.promptConnect);
	});
}

function FBFlashBridgeShowShare(link) {
	FB.Connect.showShareDialog(link, function() {
		alert("Share Test");
	});
}

function FBFlashBridgeSendNotification(arrUsers, sNotification) {
	api.notifications_send(arrUsers, sNotification, function(result, ex) {
		FBFlashBridgeDispatcher("NOTIFICATION_SENT");
		
		FBFlashBridgeFlashDispatcher("onNotificationSent");
	}); 
}

function FBFlashBridgeSendEMail(arrRecipients, sSubject, sText, sFbml) {
	api.notifications_sendEmail(arrRecipients, sSubject, sText, sFbml, function(result, ex) {
		if(result) {
			FBFlashBridgeDispatcher("EMAIL_SENT");
		
			FBFlashBridgeFlashDispatcher("onEmailSent");
		} else {
			FBFlashBridgeDispatcher("EMAIL_SENT_FAILED_AUTH");
		
			FBFlashBridgeFlashDispatcher("onEmailSentFailedAuth");
		}
	}); 
}

//***********************************************************************************************************//

function FBFlashBridgeLogOut() {
	FB.Connect.logout(function() { 
		trace("LOGGED_OUT");
		
		isLoggedIn = false;
		
		FBFlashBridgeDispatcher("LOGGED_OUT");
		
		FBFlashBridgeFlashDispatcher("onLoggedOut");
	});
}

function FBFlashBridgeLogIn() {
	FB.Connect.requireSession(function() {
		trace("LOG IN READY");
		
		FBFlashBridgeLoggedIn();
	}, true);
}

function FBFlashBridgeLoggedIn() {
	api = FB.Facebook.apiClient;
		
	trace("LOGGED_IN");
	
	if(!isLoggedIn) {
		isLoggedIn = true;

		FBFlashBridgeDispatcher("LOGGED_IN");
	
		FBFlashBridgeFlashDispatcher("onLoggedIn", api._session);
	}
}

function FBFlashBridgeOnLoad() {
	FB.ensureInit(function() {
		FB.Facebook.get_sessionState().waitUntilReady(function(session) {
			inspect(session);
			
			if(session)
				FBFlashBridgeLoggedIn();
		});
	});
}

window.onload = function() { FBFlashBridgeOnLoad(false); };

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

//***********************************************************************************************************//

function FBFlashBridgeDispatcher(eventType, data) {
	$(document).trigger(eventType, data);
}	

function FBFlashBridgeListener(eventType, func) {
	$(document).bind(eventType, function(e, data) { func(data); });
}

function FBFlashBridgeFlashDispatcher(func) {
	if(oFlash && isFlashReady) { // && typeof obj.JStoASviaExternalInterface != "undefined")
		if(arguments.length > 1)
			oFlash[func](Array.prototype.slice.call(arguments).slice(1)[0]);
		else
			oFlash[func]();
	}
}

function FBFlashBridgeInit(appName, appKey, appURL, flashObj) {
	sAppName = appName;
	sAppKey = appKey;
	sAppURL = appURL;

	oFlash = flashObj;
	
	FB.init(sAppKey, sAppURL);
}

function FBFlashBridgeFlashLoaded() {
	trace("FLASH LOADED");
	
	isFlashReady = true;
	
	if(isLoggedIn) { // NOTIFY FLASH
		trace("FB WAS ALLREADY LOGGED IN");
		
		FBFlashBridgeFlashDispatcher("onLoggedIn", api._session);
	}
}

//***********************************************************************************************************//