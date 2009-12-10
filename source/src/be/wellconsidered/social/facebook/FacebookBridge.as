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
		
		public function print_r(obj:*, level:int = 0, output:String = ""):* {
		    var tabs:String = "";
		    
		    for(var i:int = 0; i < level; i++, tabs += "\t");
		    
		    for(var child:* in obj) {
		        output += tabs +"["+ child +"] => "+ obj[child];
		        
		        var childOutput:String = FacebookBridge.getInstance().print_r(obj[child], level+1);
		        
		        if(childOutput != '') output += ' {\n'+ childOutput + tabs +'}';
		        
		        output += "\n";
		    }
		    
		    return output;
		 }	
	}
}

internal class SingletonEnforcer {}