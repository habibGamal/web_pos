
### 1. **Products (the base definition)**

This is your “parent” object. Example:

* Product: *T-shirt*
* Category: *Clothing*

**Table: `products`**

```sql
id | name     | category_id | description | ...
---+----------+-------------+-------------
1  | T-shirt  | 12          | ... 
```

---

### 2. **Attributes (what characteristics exist for products)**

Attributes define *possible dimensions of variation*.

* Example: Size, Color, Material

**Table: `attributes`**

```sql
id | name     | type    |
---+----------+---------+
1  | Size     | select  |
2  | Color    | select  |
3  | Material | select  |
```

* `type` could be `select`, `text`, `number`, `boolean`, etc.

---

### 3. **Attribute Values (allowed options per attribute)**

Defines the *possible values*.

* Size → S, M, L
* Color → Red, Blue
* Material → Cotton, Polyester

**Table: `attribute_values`**

```sql
id | attribute_id | value    
---+--------------+--------  
1  | 1 (Size)     | S        
2  | 1 (Size)     | M        
3  | 1 (Size)     | L        
4  | 2 (Color)    | Red      
5  | 2 (Color)    | Blue     
6  | 3 (Material) | Cotton   
7  | 3 (Material) | Polyester
```

---

### 4. **Variants (actual SKUs / purchasable items)**

Each **variant is a real SKU** (stock keeping unit).

* Example: "T-shirt, M, Blue, Cotton"

**Table: `variants`**

```sql
id | product_id | sku         | price | stock | ...
---+------------+-------------+-------+-------
1  | 1 (T-shirt)| TS-M-BL-CTN | 20.00 | 100
2  | 1 (T-shirt)| TS-L-RD-PLY | 22.00 | 50
```

---

### 5. **Variant → Attribute Values (link table)**

This connects each variant to the attribute values that define it.

**Table: `variant_attribute_values`**

```sql
variant_id | attribute_value_id
-----------+-------------------
1          | 2 (M)
1          | 5 (Blue)
1          | 6 (Cotton)
2          | 3 (L)
2          | 4 (Red)
2          | 7 (Polyester)
```

So:

* Variant `1` = M + Blue + Cotton
* Variant `2` = L + Red + Polyester
