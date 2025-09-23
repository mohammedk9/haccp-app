// src/components/dashboard/RecentItemsList.tsx
interface RecentItem {
  title: string;
  description: string;
  date: string;
  meta?: string;
  onClick?: () => void;
}

interface RecentItemsListProps {
  title: string;
  items: any[];
  onViewAll: () => void;
  renderItem: (item: any) => RecentItem;
  emptyMessage?: string;
}

export default function RecentItemsList({
  title,
  items,
  onViewAll,
  renderItem,
  emptyMessage = 'لا توجد عناصر'
}: RecentItemsListProps) {
  return (
    <div className="recent-items-card">
      <div className="recent-items-header">
        <h3>{title}</h3>
        <button onClick={onViewAll} className="view-all-btn">
          عرض الكل
          <i className="bi bi-arrow-left"></i>
        </button>
      </div>

      <div className="recent-items-list">
        {items.length > 0 ? (
          items.slice(0, 5).map((item, index) => {
            const renderedItem = renderItem(item);
            return (
              <div
                key={index}
                className="recent-item"
                onClick={renderedItem.onClick}
              >
                <div className="item-content">
                  <h4>{renderedItem.title}</h4>
                  <p>{renderedItem.description}</p>
                  {renderedItem.meta && <span className="item-meta">{renderedItem.meta}</span>}
                </div>
                <div className="item-date">
                  {new Date(renderedItem.date).toLocaleDateString('ar-SA')}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}