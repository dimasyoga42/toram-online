### TORAM ONLINE XTALL (REST API)

API ini menyediakan akses publik ke data Xtall (Crystal Equipment) dari game Toram Online, termasuk
pencarian berdasarkan nama, ID, dan filter berdasarkan tipe. Data disimpan dan dikelola melalui
Supabase

```
update log:
- 9-08-2025 data xtall senjata, armor, topi sudah lengkap
- 9-08-2025 data registlet sudah lengkap (endpoint belum di tambahkan)
- 9-08-2025 penghapusan endpoint pencarian berdasarkan id
- 10-08-2025 data xtall lengkap
next update:
- penambahan endpoint regist dan menambahkan data xtall cincin
```

### Base URL:

```
https://rest-api-toram-online.vercel.app/xtall
```

---

### Endpoints

1. GET `/xtall`

Mengambil semua data xtall dengan fitur pagination, pencarian, dan filter berdasarkan tipe.

###### Query Parameters:

| Parameter | Tipe   | Deskripsi                                | Default |
| --------- | ------ | ---------------------------------------- | ------- |
| `page`    | Number | Halaman yang ingin ditampilkan           | `1`     |
| `limit`   | Number | Jumlah item per halaman                  | `10`    |
| `type`    | String | Filter berdasarkan tipe xtall (opsional) | -       |
| `search`  | String | Pencarian berdasarkan nama (opsional)    | -       |

###### Contoh Request:

```
GET /xtall?page=2&limit=5&type=armor&search=mana

```

###### Contoh Respon

```json
{
	"success": true,
	"data": [
		{
			"id": 12,
			"name": "Mana Crystal",
			"type": "armor",
			"stat": 20,
			"upgrade": "+3 STR"
		}
	],
	"pagination": {
		"page": 2,
		"limit": 5,
		"total": 12,
		"totalPages": 3
	}
}
```

---

2. GET `/xtall/:id` (delete)

Deskripsi: Mengambil satu data xtall berdasarkan `id.`

###### URL Parameters:

| Parameter | Tipe   | Deskripsi             |
| --------- | ------ | --------------------- |
| `id`      | Number | ID dari xtall (wajib) |

```
GET /xtall/3
```

###### Respon:

```json
{
	"success": true,
	"data": {
		"id": 3,
		"name": "Sakura XT",
		"type": "armor",
		"stat": 15,
		"upgrade": "+10% HP"
	}
}
```

3. GET `/xtall/name/:name`

Deskripsi: Mencari xtall berdasarkan name (mirip/tidak case-sensitive).

| Parameter | Tipe   | Deskripsi  |
| --------- | ------ | ---------- |
| `name`    | String | Nama xtall |

```
GET /xtall/name/xtal
```

###### Respon:

```json
{
	"success": true,
	"data": {
		"name": "Dark XTAL",
		"type": "weapon",
		"stat": 25,
		"upgrade": "+3% Critical"
	}
}
```

---

### Catatan

- Semua pencarian nama menggunakan case-insensitive dan partial match (ILIKE '%name%').

- Endpoint masih bersifat read-only, tidak ada POST/PUT/DELETE.

- API cocok digunakan untuk query di aplikasi katalog, bot Discord, atau database builder.
