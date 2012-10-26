using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using SignalR.Hubs;

namespace MyChess.Models
{
    public class MyChess : Hub
    {
        public void Sync(string e)
        {
            Clients.Sync(e);
        }
    }

}