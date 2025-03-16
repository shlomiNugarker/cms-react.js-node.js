import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Input, Select, Table, Pagination, Modal, Form, Textarea } from '../components/ui';
import { useAuth } from '../context/AuthContext';

interface Content {
  _id: string;
  title: string;
  slug: string;
  contentType: string;
  status: string;
  author: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const ContentManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    contentType: 'post',
    status: 'draft',
    categories: [],
    tags: [],
  });
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchContents();
    }
  }, [isAuthenticated, currentPage, searchTerm, contentTypeFilter, statusFilter]);
  
  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/content`, {
        params: {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          contentType: contentTypeFilter || undefined,
          status: statusFilter || undefined,
        },
      });
      
      setContents(response.data.contents);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch content');
      setLoading(false);
    }
  };
  
  const handleCreateContent = async () => {
    try {
      await axios.post('/api/content', formData);
      setIsCreateModalOpen(false);
      resetForm();
      fetchContents();
    } catch (err) {
      setError('Failed to create content');
    }
  };
  
  const handleEditContent = async () => {
    if (!currentContent) return;
    
    try {
      await axios.put(`/api/content/${currentContent._id}`, formData);
      setIsEditModalOpen(false);
      resetForm();
      fetchContents();
    } catch (err) {
      setError('Failed to update content');
    }
  };
  
  const handleDeleteContent = async () => {
    if (!currentContent) return;
    
    try {
      await axios.delete(`/api/content/${currentContent._id}`);
      setIsDeleteModalOpen(false);
      fetchContents();
    } catch (err) {
      setError('Failed to delete content');
    }
  };
  
  const openEditModal = (content: Content) => {
    setCurrentContent(content);
    setFormData({
      title: content.title,
      content: '', // We need to fetch the full content
      contentType: content.contentType,
      status: content.status,
      categories: [],
      tags: [],
    });
    
    // Fetch full content details
    axios.get(`/api/content/id/${content._id}`)
      .then(response => {
        setFormData(prev => ({
          ...prev,
          content: response.data.content,
          categories: response.data.categories || [],
          tags: response.data.tags || [],
        }));
      })
      .catch(err => {
        setError('Failed to fetch content details');
      });
    
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (content: Content) => {
    setCurrentContent(content);
    setIsDeleteModalOpen(true);
  };
  
  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      contentType: 'post',
      status: 'draft',
      categories: [],
      tags: [],
    });
    setCurrentContent(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Content Management</h1>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-48">
          <Select
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="post">Post</option>
            <option value="page">Page</option>
            <option value="product">Product</option>
            <option value="custom">Custom</option>
          </Select>
        </div>
        
        <div className="w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </div>
        
        <Button onClick={() => setIsCreateModalOpen(true)}>Create New</Button>
      </div>
      
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Author</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((content) => (
                <tr key={content._id}>
                  <td>{content.title}</td>
                  <td>{content.contentType}</td>
                  <td>{content.status}</td>
                  <td>{content.author?.username || 'Unknown'}</td>
                  <td>{new Date(content.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(content)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteModal(content)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}
      
      {/* Create Content Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Content"
      >
        <Form onSubmit={(e) => { e.preventDefault(); handleCreateContent(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="content">Content</label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={10}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="contentType">Content Type</label>
                <Select
                  id="contentType"
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleInputChange}
                >
                  <option value="post">Post</option>
                  <option value="page">Page</option>
                  <option value="product">Product</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              
              <div>
                <label htmlFor="status">Status</label>
                <Select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </div>
        </Form>
      </Modal>
      
      {/* Edit Content Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Content"
      >
        <Form onSubmit={(e) => { e.preventDefault(); handleEditContent(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-title">Title</label>
              <Input
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="edit-content">Content</label>
              <Textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={10}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-contentType">Content Type</label>
                <Select
                  id="edit-contentType"
                  name="contentType"
                  value={formData.contentType}
                  onChange={handleInputChange}
                >
                  <option value="post">Post</option>
                  <option value="page">Page</option>
                  <option value="product">Product</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              
              <div>
                <label htmlFor="edit-status">Status</label>
                <Select
                  id="edit-status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit">Update</Button>
            </div>
          </div>
        </Form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Content"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete "{currentContent?.title}"?</p>
          <p className="text-red-500">This action cannot be undone.</p>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteContent}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContentManagement; 