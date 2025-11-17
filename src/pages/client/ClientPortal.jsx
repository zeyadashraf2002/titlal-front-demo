import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Download, Star, Send } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const ClientPortal = () => {
  const { t } = useTranslation();
  const { token } = useParams();
  const [task, setTask] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    // Mock data - replace with API call using token
    setTask({
      id: 1,
      title: 'Garden Maintenance - Villa 123',
      description: 'Complete garden maintenance including lawn mowing, hedge trimming, and flower bed care.',
      worker: 'Ahmed Ali',
      location: '123 Main St, Dubai',
      status: 'Completed',
      completedDate: '2025-11-03',
      beforePhoto: 'https://via.placeholder.com/400x300?text=Before+Photo',
      afterPhoto: 'https://via.placeholder.com/400x300?text=After+Photo',
      aiScore: 92,
      invoice: {
        number: 'INV-001',
        amount: 1500,
        date: '2025-11-03',
        items: [
          { description: 'Garden Maintenance Service', quantity: 1, price: 1200 },
          { description: 'Materials & Supplies', quantity: 1, price: 300 },
        ],
      },
    });
  }, [token]);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    // Submit feedback via API
    console.log({ rating, feedback });
    setFeedbackSubmitted(true);
  };

  const handleDownloadInvoice = () => {
    // Download invoice PDF
    alert('Downloading invoice...');
  };

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">🌿 Garden MS</h1>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('client.title')}</h2>
          <p className="text-gray-600">{t('client.taskDetails')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details */}
            <Card>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h3>
                  <p className="text-gray-600">{task.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-500">Worker</p>
                    <p className="font-semibold">{task.worker}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-semibold">{task.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed Date</p>
                    <p className="font-semibold">{task.completedDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {task.status}
                    </span>
                  </div>
                </div>

                {task.aiScore && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800 mb-1">AI Quality Score</p>
                    <p className="text-3xl font-bold text-green-600">{task.aiScore}%</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Before/After Photos */}
            <Card title={t('client.viewPhotos')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">{t('client.beforePhoto')}</h4>
                  <img
                    src={task.beforePhoto}
                    alt="Before"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('client.afterPhoto')}</h4>
                  <img
                    src={task.afterPhoto}
                    alt="After"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            </Card>

            {/* Feedback Form */}
            {!feedbackSubmitted ? (
              <Card title={t('client.feedback')}>
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('client.rating')}
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('client.comments')}
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Share your experience..."
                    />
                  </div>

                  <Button type="submit" icon={Send}>
                    {t('client.submitFeedback')}
                  </Button>
                </form>
              </Card>
            ) : (
              <Card>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Thank you for your feedback!
                  </h3>
                  <p className="text-gray-600">
                    We appreciate your time and will use your feedback to improve our services.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar - Invoice */}
          <div>
            <Card title={t('client.invoice')}>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-500">Invoice Number</p>
                  <p className="font-semibold">{task.invoice.number}</p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{task.invoice.date}</p>
                </div>

                <div className="space-y-2">
                  {task.invoice.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.description} x{item.quantity}
                      </span>
                      <span className="font-semibold">${item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-2xl text-primary-600">
                      ${task.invoice.amount}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  variant="primary"
                  icon={Download}
                  onClick={handleDownloadInvoice}
                >
                  {t('client.downloadInvoice')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;

