/**
 * Feedback Summary Component
 */


const FeedbackSummary = ({ summary }) => {
  if (!summary) return null;

  const { approve, disapprove, total, approvePercentage, disapprovePercentage } = summary;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h4 className="font-serif text-lg text-bodhi-navy mb-4">Public Sentiment</h4>
      
      <div className="flex items-center gap-8 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{approve}</div>
          <div className="text-sm text-gray-500">Approve</div>
          <div className="text-xs text-gray-400">{approvePercentage?.toFixed(1)}%</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600">{disapprove}</div>
          <div className="text-sm text-gray-500">Disapprove</div>
          <div className="text-xs text-gray-400">{disapprovePercentage?.toFixed(1)}%</div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-bodhi-navy">{total}</div>
          <div className="text-sm text-gray-500">Total Votes</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${approvePercentage || 0}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Approve {approvePercentage?.toFixed(0)}%</span>
        <span>Disapprove {disapprovePercentage?.toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default FeedbackSummary;