module.exports = async function (context, req) {
    try {
        // Static categories for now - later can be dynamic from database
        const categories = [
            { id: "work", name: "Work", color: "#3498db" },
            { id: "study", name: "Study", color: "#e74c3c" },
            { id: "personal", name: "Personal", color: "#2ecc71" },
            { id: "health", name: "Health", color: "#f39c12" },
            { id: "shopping", name: "Shopping", color: "#9b59b6" },
            { id: "other", name: "Other", color: "#95a5a6" }
        ];

        context.res = {
            status: 200,
            body: categories
        };
    } catch (error) {
        context.log('Error fetching categories:', error);
        context.res = {
            status: 500,
            body: { message: "Error fetching categories." }
        };
    }
};