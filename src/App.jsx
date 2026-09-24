import { useEffect, useState } from 'react';
import { Alert, Badge, Button, Container, Form, Modal, Spinner, Table } from 'react-bootstrap';
import ProductForm from './components/ProductForm';
import * as api from './services/api';
const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
export default function App() {
  const [products, setProducts] = useState([]), [loading, setLoading] = useState(true);
  const [error, setError] = useState(''), [notice, setNotice] = useState(''), [search, setSearch] = useState('');
  const [editor, setEditor] = useState(null), [view, setView] = useState(null), [remove, setRemove] = useState(null), [deleting, setDeleting] = useState(false), [deleteError, setDeleteError] = useState('');
  async function load() {
    setLoading(true); setError('');
    try { const { data } = await api.getProducts(); setProducts(data.data); }
    catch (err) { setError(api.errorMessage(err)); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  async function save(values) {
    try {
      const { data } = editor.product ? await api.updateProduct(editor.product._id, values) : await api.createProduct(values);
      setProducts(current => editor.product ? current.map(p => p._id === data.data._id ? data.data : p) : [data.data, ...current]);
      setNotice(data.message); setEditor(null);
    } catch (err) { throw new Error(api.errorMessage(err)); }
  }
  async function confirmDelete() {
    setDeleting(true); setDeleteError('');
    try { await api.deleteProduct(remove._id); setProducts(current => current.filter(p => p._id !== remove._id)); setRemove(null); setNotice('Product deleted.'); }
    catch (err) { setDeleteError(api.errorMessage(err)); }
    finally { setDeleting(false); }
  }
  const filtered = products.filter(p => `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase()));
  return <><nav className="topbar"><Container className="d-flex justify-content-between align-items-center"><a className="brand" href="/">◈ Product Desk</a><span className="small">Inventory workspace</span></Container></nav>
    <Container className="py-5"><header className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4"><div><p className="eyebrow">YOUR CATALOG, ORGANIZED</p><h1>Product inventory</h1><p className="text-secondary mb-0">A simple place to manage what you sell.</p></div><Button onClick={() => setEditor({ product: null })} disabled={loading || !!error}>+ Add product</Button></header>
    <div className="row g-3 mb-4">{[['Products', products.length], ['Units in stock', products.reduce((n,p) => n+p.stock,0)], ['Inventory value', money(products.reduce((n,p) => n+p.price*p.stock,0))]].map(([label,value]) => <div className="col-md-4" key={label}><div className="stat"><span>{label}</span><strong>{loading || error ? '—' : value}</strong></div></div>)}</div>
    {notice && <Alert variant="success" dismissible onClose={() => setNotice('')} role="status">{notice}</Alert>}
    {error && <Alert variant="danger">{error} <Button size="sm" variant="outline-danger" onClick={load}>Retry</Button></Alert>}
    <section className="catalog"><div className="d-flex flex-wrap justify-content-between gap-3 p-4 border-bottom"><h2 className="h5 mb-0 align-self-center">All products</h2><Form.Control className="search" aria-label="Search products by name or category" placeholder="Search name or category…" value={search} onChange={e => setSearch(e.target.value)}/></div>
    {loading ? <div className="empty" role="status"><Spinner size="sm"/> Loading products…</div> : error ? <div className="empty">Your catalog could not be loaded.</div> : !filtered.length ? <div className="empty"><h3 className="h5">{search ? 'No matching products' : 'Your catalog starts here'}</h3><p>{search ? 'Try another name or category.' : 'Add your first product to get started.'}</p></div> : <Table responsive hover className="mb-0 align-middle"><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th className="text-end">Actions</th></tr></thead><tbody>{filtered.map(p => <tr key={p._id}><td className="fw-semibold">{p.name}</td><td>{p.category}</td><td className="text-nowrap">{money(p.price)}</td><td><Badge bg={p.stock ? 'light' : 'warning'} text="dark">{p.stock} units</Badge></td><td><div className="d-flex justify-content-end gap-2"><Button size="sm" variant="outline-secondary" onClick={() => setView(p)}>View</Button><Button size="sm" variant="outline-primary" onClick={() => setEditor({ product: p })}>Edit</Button><Button size="sm" variant="outline-danger" onClick={() => { setDeleteError(''); setRemove(p); }}>Delete</Button></div></td></tr>)}</tbody></Table>}
    </section><footer className="mt-4 small text-secondary">Product Desk · Built with React, Express & MongoDB</footer></Container>
    {editor && <ProductForm product={editor.product} onClose={() => setEditor(null)} onSave={save}/>}
    <Modal show={!!view} onHide={() => setView(null)} centered><Modal.Header closeButton><Modal.Title>{view?.name}</Modal.Title></Modal.Header><Modal.Body><p><strong>Category:</strong> {view?.category}</p><p><strong>Price:</strong> {money(view?.price || 0)}</p><p><strong>Stock:</strong> {view?.stock}</p><p className="description">{view?.description || 'No description provided.'}</p></Modal.Body></Modal>
    <Modal show={!!remove} onHide={deleting ? undefined : () => setRemove(null)} backdrop="static" keyboard={!deleting} centered><Modal.Header closeButton={!deleting}><Modal.Title>Delete product?</Modal.Title></Modal.Header><Modal.Body>{deleteError && <Alert variant="danger">{deleteError}</Alert>}Delete <strong>{remove?.name}</strong>? This cannot be undone.</Modal.Body><Modal.Footer><Button variant="outline-secondary" disabled={deleting} onClick={() => setRemove(null)}>Cancel</Button><Button variant="danger" disabled={deleting} onClick={confirmDelete}>{deleting ? 'Deleting…' : 'Delete product'}</Button></Modal.Footer></Modal>
  </>;
}
