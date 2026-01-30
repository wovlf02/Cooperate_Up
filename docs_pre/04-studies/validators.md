# ✅ 스터디 검증

## 파일 위치

`src/lib/validators/study-validator.js`

---

## Zod 스키마

### createStudySchema

```javascript
import { z } from 'zod'

export const createStudySchema = z.object({
  name: z.string()
    .min(2, '스터디 이름은 2자 이상이어야 합니다')
    .max(50, '스터디 이름은 50자 이하여야 합니다'),
  description: z.string()
    .min(1, '설명을 입력해주세요')
    .max(2000, '설명은 2000자 이하여야 합니다'),
  category: z.string()
    .min(1, '카테고리를 선택해주세요'),
  emoji: z.string()
    .min(1, '이모지를 선택해주세요'),
  maxMembers: z.number()
    .min(2, '최소 2명 이상이어야 합니다')
    .max(100, '최대 100명까지 가능합니다')
    .optional()
    .default(10),
  isPublic: z.boolean().optional().default(true),
  autoApprove: z.boolean().optional().default(true),
  isRecruiting: z.boolean().optional().default(true),
  tags: z.array(z.string()).optional().default([]),
})
```

### updateStudySchema

```javascript
export const updateStudySchema = createStudySchema.partial()
```

### joinStudySchema

```javascript
export const joinStudySchema = z.object({
  introduction: z.string()
    .max(500, '자기소개는 500자 이하여야 합니다')
    .optional(),
  motivation: z.string()
    .max(500, '가입 동기는 500자 이하여야 합니다')
    .optional(),
  level: z.enum(['beginner', 'elementary', 'intermediate', 'advanced'])
    .optional(),
})
```

---

## 유효성 검사 함수

### validateStudyData

```javascript
export function validateStudyData(data, schema = createStudySchema) {
  try {
    return {
      valid: true,
      data: schema.parse(data)
    }
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    }
  }
}
```

---

## 관련 문서

- [CRUD API](./api-crud.md) - 스터디 API
- [헬퍼](./helpers.md) - 헬퍼 함수

