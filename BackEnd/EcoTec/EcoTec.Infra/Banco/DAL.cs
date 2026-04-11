using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace EcoTec.Infra.Banco;

public class DAL<T> where T : class
{
    private readonly EcoTecContext _context;

    public DAL(EcoTecContext context)
    {
        _context = context;
    }

    public IEnumerable<T> Listar(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _context.Set<T>();

        foreach (var include in includes)
        {
            query = query.Include(include);
        }

        return query.ToList();
    }

    public void Adicionar(T objeto)
    {
        _context.Set<T>().Add(objeto);
        _context.SaveChanges();
    }

    public void Atualizar(T objeto)
    {
        _context.Set<T>().Update(objeto);
        _context.SaveChanges();
    }

    public void Deletar(T objeto)
    {
        _context.Set<T>().Remove(objeto);
        _context.SaveChanges();
    }

    public T? RecuperarPor(Func<T, bool> condicao, params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _context.Set<T>();

        foreach (var include in includes)
        {
            query = query.Include(include);
        }

        return query.FirstOrDefault(condicao);
    }
}
