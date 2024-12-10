import { useEffect, useState } from "react";
import parse from "html-react-parser"; // Import the HTML parser

// Import Groq SDK correctly using ES6 import
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: "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",
    dangerouslyAllowBrowser: true,
});

interface RecommendationProps {
    monthly_sale: any[];
    total_sales: number;
    store_sale: any[];
    average_sale: number;
    top_5_products: any[];
    low_5_products: any[];
}

const Recommendation: React.FC<RecommendationProps> = ({  monthly_sale, total_sales, store_sale, average_sale, top_5_products, low_5_products}) => {
    const [recommendation, setRecommendation] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const fetchRecommendation = async () => {
        setLoading(true);
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a business analyst provides insights and recommendations in layman terms.",
                    },
                    {
                        role: "user",
                        content: `
                        Based on the following sales data (in Philippine Pesos), provide an analysis and recommendations. Don't compute the highest and lowest sales. The output should be in HTML format with Tailwind CSS styling, dont add greeting, following this pattern:
                
                        "<div class='bg-gray-100 p-6 rounded-lg shadow-md'>
                            <h2 class='text-2xl font-bold text-gray-800 mb-4'>Insights</h2>
                            <ul class='list-disc list-inside text-gray-700'>
                                <li>Insight 1</li>
                                <li>Insight 2</li>
                                <li>Insight 3</li>
                                <li>Insight 4</li>
                            </ul>
                        </div>

                        <div class='bg-blue-100 p-6 rounded-lg shadow-md mt-4'>
                            <h2 class='text-2xl font-bold text-blue-800 mb-4'>Recommendations</h2>
                            <ul class='list-disc list-inside text-blue-700'>
                                <li>Recommendation 1</li>
                                <li>Recommendation 2</li>
                                <li>Recommendation 3</li>
                                <li>Recommendation 4</li>
                                <li>Recommendation 5</li>
                            </ul>
                        </div>"

                        This is the data for 2024
                        
                        Total Sales: ${total_sales}
                        Sales: ${JSON.stringify(monthly_sale)}
                        Sales based on store: ${JSON.stringify(store_sale)}
                        Average sale per order: ${average_sale}
                        Top 5 highest sale products: ${JSON.stringify(top_5_products)}
                        Top 5 lowest sale products: ${JSON.stringify(low_5_products)}
                        `,
                    },
                ],
                model: "llama3-8b-8192",
                max_tokens: 1024,
                temperature: 1,
            });

            setRecommendation(chatCompletion.choices[0]?.message.content || "No recommendation available.");
        } catch (error) {
            console.error("Error fetching recommendation:", error);
            setRecommendation("Error fetching recommendation.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecommendation();
    }, []);

    return (
        <div className="recommendation-container p-5 border-2 border-gray-300 rounded-md shadow-md bg-white w-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Analysis</h2>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded"
                    onClick={fetchRecommendation}
                >
                    Generate
                </button>
            </div>
            <hr className="my-4 border-gray-300" />
            {loading ? (
                <div className="flex justify-center">
                    <div className="spinner-border animate-spin w-8 h-8 border-4 border-blue-500 rounded-full"></div>
                </div>
            ) : (
                <div className="text-lg text-gray-700">{parse(recommendation)}</div>
            )}
        </div>
    );
};

export default Recommendation;
