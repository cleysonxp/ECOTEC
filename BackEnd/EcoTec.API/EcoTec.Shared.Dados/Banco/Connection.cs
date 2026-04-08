using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcoTec.Shared.Dados.Banco;

internal class Connection
{
    private string connectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=EcoTec;Integrated Security=True;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";

    //private string connectionString = "Data Source=(localdb)\\MSSQLLocalDB;Initial Catalog=EcoTec;Integrated Security=True;Connect Timeout=30;Encrypt=False;Trust Server Certificate=False;Application Intent=ReadWrite;Multi Subnet Failover=False";
}
