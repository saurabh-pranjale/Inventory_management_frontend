import { useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
export default function ProductForm({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || { name: '', category: '', price: '', stock: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await onSave({ name: form.name.trim(), category: form.category.trim(), price: Number(form.price), stock: Number(form.stock), description: form.description.trim() }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <Modal show onHide={busy ? undefined : onClose} backdrop="static" keyboard={!busy} centered>
    <Modal.Header closeButton={!busy}><Modal.Title>{product ? 'Edit product' : 'Add product'}</Modal.Title></Modal.Header>
    <Form onSubmit={submit}><Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
      <fieldset disabled={busy}>
      {[['name','Product name','text',100],['category','Category','text',60],['price','Price (INR)','number'],['stock','Stock quantity','number']].map(([name,label,type,maxLength]) => <Form.Group className="mb-3" controlId={name} key={name}><Form.Label>{label}</Form.Label><Form.Control required name={name} type={type} maxLength={maxLength} min={type === 'number' ? 0 : undefined} max={name === 'price' ? 1e9 : name === 'stock' ? 1e6 : undefined} step={name === 'price' ? '0.01' : name === 'stock' ? '1' : undefined} value={form[name]} onChange={change}/></Form.Group>)}
      <Form.Group controlId="description"><Form.Label>Description</Form.Label><Form.Control as="textarea" rows={3} name="description" maxLength={2000} value={form.description} onChange={change}/></Form.Group>
      </fieldset>
    </Modal.Body><Modal.Footer><Button variant="outline-secondary" disabled={busy} onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</Button></Modal.Footer></Form>
  </Modal>;
}
