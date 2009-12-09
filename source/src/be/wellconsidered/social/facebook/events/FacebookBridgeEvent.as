package be.wellconsidered.social.facebook.events
{
	import flash.events.Event;

	public class FacebookBridgeEvent extends Event
	{
		public static const RESULT:String = "result";
		public static const ERROR:String = "error";
		
		private var _func:String = "";
		private var _data:Object;
		
		public function FacebookBridgeEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false, func:String="", data:Object=null)
		{
			super(type, bubbles, cancelable);
			
			_func = func;
			_data = data;
		}
		
		public function get func():String {
			return _func;
		}
		
		public function get data():Object {
			return _data;
		}
	}
}