from flask import Flask, jsonify, request
from flask_cors import CORS
from pystac_client import Client

app = Flask(__name__)
# CORSを許可 (Reactは通常 http://localhost:5173 で動くため)
CORS(app)

# STAC APIのURL (Earth Search)
STAC_API_URL = "https://earth-search.aws.element84.com/v1"

@app.route('/')
def hello():
    return jsonify({"message": "Hello form Flask Backend!"})

@app.route('/api/test-search', methods=['GET'])
def test_search():
    """
    STAC APIに接続できるかテストするエンドポイント
    固定の座標と日付で検索してみる
    """
    try:
        client = Client.open(STAC_API_URL)
        
        # 試しに「つくば」周辺を検索
        # bbox=[西経, 南緯, 東経, 北緯]
        search = client.search(
            collections=["sentinel-2-l2a"],
            bbox=[140.0, 36.0, 140.2, 36.2],
            datetime="2024-01-01/2024-01-31",
            max_items=1
        )
        
        items = list(search.items())
        
        if not items:
            return jsonify({"status": "success", "count": 0, "message": "No items found"})

        # 最初の1件の情報を返す
        item = items[0]
        return jsonify({
            "status": "success",
            "count": len(items),
            "first_item_id": item.id,
            "date": item.datetime,
            "assets": list(item.assets.keys()) # 利用可能なデータ(バンド等)のキー一覧
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)