# 🪐 AGENTS.md (Root Guidelines & Ponytail Alignment)

## 📌 TL;DR
นี่คือกฎเหล็กสูงสุดในการพัฒนา **ANTIGRAVITY OS** สำหรับ AI/AGI ทุกตัวที่เข้ามารับช่วงพัฒนาต่อ เพื่อป้องกันสถาปัตยกรรมเสียหายและรักษาความประหยัดโทเคน

---

## 🪜 กฎบันไดการตัดสินใจแบบ Ponytail (Ponytail Decision Ladder)
ก่อนที่นาย (AI) จะเขียนโค้ด แก้ไขระบบ หรือเพิ่มไฟล์ใหม่ใดๆ ให้นายไล่ตรวจสอบตามข้อนี้ก่อนเสมอ (อิงตาม [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)):

```
You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.
```

1. **Does this need to be built at all? (YAGNI):** ฟีเจอร์นี้จำเป็นจริงๆ หรือไม่? ถ้าตอบไม่ได้ หรือผู้ใช้ไม่ได้สั่งชัดเจน ให้ปัดตกไปก่อน (ห้ามคิดล่วงหน้าหรือสร้างโค้ดดักไว้เผื่อ)
2. **Does the standard library already do this?:** ใช้ฟังก์ชันพื้นฐานที่ภาษานั้นๆ หรือบอร์ดของเบราว์เซอร์มีให้อยู่แล้วให้มากที่สุด
3. **Does a native platform feature cover it?:** ใช้ความสามารถพื้นฐานของ HTML5 / Vanilla CSS หรือ Web APIs ที่เบราว์เซอร์มีอยู่แล้วแทนการนำเข้าไลบรารีภายนอก
4. **Does an already-installed dependency solve it?:** ใช้เฉพาะแพ็คเกจที่ถูกติดตั้งอยู่แล้วใน `package.json` ห้ามแอบติดตั้ง `npm install` เพิ่มเติมเด็ดขาด ยกเว้นได้รับคำสั่งตรงจากบอส
5. **Can this be one line?:** ถ้าเขียนให้เสร็จในบรรทัดเดียวได้ ให้ยุบลงเหลือบรรทัดเดียว
6. **Only then: write the minimum code that works.** เขียนโค้ดส่วนเพิ่มเติมให้สั้นที่สุดเท่าที่จะทำงานได้

### Rules:
- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- Pick the edge-case-correct option when two stdlib approaches are the same size.
- Mark intentional simplifications with a `ponytail:` comment.

---

## 🛠️ สถาปัตยกรรมและการประสานงาน (Workspace Architecture)
- **Monorepo Structure:** โค้ดทั้งหมดจะแบ่งออกเป็น `apps/` และ `packages/` ห้ามนำโค้ดที่แชร์กันได้ไปยัดรวมไว้ในแอปตัวใดตัวหนึ่ง
- **Single-Room Principle:** UI หลักจะมีเพียงหน้าเดียวนั่นคือ **"HQ War Room"** ซึ่งจะมีโต๊ะของพนักงานหัวหน้าทีมต่างๆ คอยรับคำสั่งและส่งงานต่อหลังบ้าน
- **Keep it Simple:** หน้าเว็บหลักต้องตอบสนองฉับไว (Responsive) และรักษาการตกแต่งในสไตล์ Premium Glassmorphism ดาร์กโหมด
