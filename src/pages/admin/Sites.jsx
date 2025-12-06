// frontend/src/pages/admin/Sites.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Layers } from 'lucide-react';
import { sitesAPI, clientsAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SiteModal from './SiteModal';
import SectionManagement from './SectionManagement';
import Loading from '../../components/common/Loading';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [showSections, setShowSections] = useState(false);
  const [siteForSections, setSiteForSections] = useState(null);

  useEffect(() => {
    fetchSites();
    fetchClients();
  }, [clientFilter]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const params = {};
      if (clientFilter !== 'all') params.client = clientFilter;
      if (searchTerm) params.search = searchTerm;
      
      const response = await sitesAPI.getAllSites(params);
      setSites(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sites:', error);
      alert('Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getClients();
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleAddNew = () => {
    setSelectedSite(null);
    setIsModalOpen(true);
  };

  const handleEdit = (site) => {
    setSelectedSite(site);
    setSiteForSections(site);
    setShowSections(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this site? All sections and images will be deleted.')) {
      try {
        await sitesAPI.deleteSite(id);
        fetchSites();
      } catch (error) {
        console.error('Error deleting site:', error);
        alert('Failed to delete site');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSite(null);
  };

  const handleSuccess = () => {
    fetchSites();
  };

  const getSiteTypeColor = (type) => {
    const colors = {
      residential: 'bg-blue-100 text-blue-800',
      commercial: 'bg-green-100 text-green-800',
      industrial: 'bg-gray-100 text-gray-800',
      public: 'bg-purple-100 text-purple-800',
      agricultural: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-8 h-8 text-primary-600" />
            Sites Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all work sites and their sections</p>
        </div>
        <Button onClick={handleAddNew} icon={Plus}>
          Add New Site
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client._id} value={client._id}>{client.name}</option>
            ))}
          </select>
        </div>
        <Button
          variant="secondary"
          onClick={fetchSites}
        >
          Apply Filters
        </Button>
      </div>

      {/* Sites Grid */}
      {filteredSites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No sites found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map(site => (
            <Card key={site._id} className="hover:shadow-lg transition-shadow">
              {/* Cover Image */}
              <div className="h-48 bg-gray-100 rounded-t-lg overflow-hidden -mx-6 -mt-6 mb-4">
                {site.coverImage?.url ? (
                  <img
                    src={site.coverImage.url}
                    alt={site.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                    <MapPin className="w-16 h-16 text-primary-400" />
                  </div>
                )}
              </div>

              {/* Site Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                      {site.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {site.client?.name || 'N/A'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSiteTypeColor(site.siteType)}`}>
                    {site.siteType}
                  </span>
                </div>

                {site.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {site.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Area</p>
                    <p className="font-semibold text-sm">{site.totalArea || 0}m²</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Sections</p>
                    <p className="font-semibold text-sm flex items-center justify-center gap-1">
                      <Layers className="w-3 h-3" />
                      {site.sections?.length || 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Tasks</p>
                    <p className="font-semibold text-sm">{site.totalTasks || 0}</p>
                  </div>
                </div>

                {site.location?.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600 pt-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{site.location.address}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(site)}
                    icon={Edit}
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(site._id)}
                    icon={Trash2}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <SiteModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        site={selectedSite}
        clients={clients}
        onSuccess={handleSuccess}
      />

      {/* Section Management Modal */}
      {showSections && siteForSections && (
        <Modal
          isOpen={showSections}
          onClose={() => {
            setShowSections(false);
            setSiteForSections(null);
          }}
          title={`Manage Sections - ${siteForSections.name}`}
          size="xl"
        >
          <SectionManagement
            site={siteForSections}
            onUpdate={() => {
              fetchSites();
              // Refresh site data
              sitesAPI.getSite(siteForSections._id).then(res => {
                setSiteForSections(res.data.data);
              });
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Sites;