package be.wellconsidered.social.facebook
{
	import be.wellconsidered.social.facebook.events.FacebookBridgeEvent;
	
	import flash.events.EventDispatcher;
	import flash.external.ExternalInterface;
	
	[Event(name="result", type="be.wellconsidered.social.facebook.events.FacebookBridgeEvent")]
	[Event(name="error", type="be.wellconsidered.social.facebook.events.FacebookBridgeEvent")]
	public class FacebookBridge extends EventDispatcher
	{
		private static var _instance:FacebookBridge;
		
		public function FacebookBridge(se:SingletonEnforcer) {
		}
		
		public static function getInstance():FacebookBridge {
			if(!_instance) { 
				_instance = new FacebookBridge(new SingletonEnforcer());
				
				ExternalInterface.addCallback("handleJSCall", _instance.handleJSCall);
			}
		
			return _instance;
		}
		
		public function init():void {
			ExternalInterface.call("_fbFlashBridge.onFlashLoaded");
			ExternalInterface.call("_fbFlashBridge.checkLogin");
		}
		
		private function handleJSCall(data:Array):void {
			dispatchEvent(new FacebookBridgeEvent(FacebookBridgeEvent.RESULT, false, true, String(data[0]), data[1]));
		}
	}
}

internal class SingletonEnforcer {}