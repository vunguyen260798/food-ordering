const mockData = {
    "data": [
        {
            "transaction_id": "bb3a067357a29ad1faa1a08952eae79abec049535dc8a6ccb85183e66de9b339",
            "token_info": {
                "symbol": "USDT",
                "address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
                "decimals": 6,
                "name": "Tether USD"
            },
            "block_timestamp": 1762324212000,
            "from": "TPjWxhmMafBpv3BiDr6Uv5Nwo9i4CNfFMa",
            "to": "TXXGsnvM3dtr5LZp13QKHnnfmqKsuYTVdk",
            "type": "Transfer",
            "value": "15000001"
        },
        {
            "transaction_id": "d6fded3231bf417bb0962adc1cabf28bd68b2926192af1b12b0d6fc1725303da",
            "token_info": {
                "symbol": "USDT",
                "address": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
                "decimals": 6,
                "name": "Tether USD"
            },
            "block_timestamp": 1762320516000,
            "from": "TXdD95NERx711hVQVqLK1xnTLerNAtXZmw",
            "to": "TXXGsnvM3dtr5LZp13QKHnnfmqKsuYTVdk",
            "type": "Transfer",
            "value": "15000039"
        },
    ],
}

const getTest = async (req, res) => {
    try {
        // Simulate fetching data from an external API
        const transactions = mockData.data;
        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching test data',
            error: error.message
        });
    }
};

module.exports = {
    getTest,
};

