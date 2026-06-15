# API layer

API code is separated by responsibility:

- `src/config/apiUrls.ts` contains endpoint paths.
- `src/lib/apiClient.ts` configures Axios and attaches the bearer token.
- `src/services/api` contains typed functions grouped by backend feature.

Import services from one place:

```ts
import { courseApi, roleApi } from "@/services/api";

const courses = await courseApi.list({ page: 1, status: "PUBLISHED" });
await roleApi.replacePermissions(roleId, ["COURSE_VIEW", "COURSE_CREATE"]);
```

For a GET request controlled by a React component:

```ts
const { data, isLoading, error, refetch } = useGet<Course[]>(
  API_URLS.courses.list,
);
```

Set `VITE_API_BASE_URL` in `.env`. Never store bearer tokens or secrets in the
repository. For a new API, add its URL, payload types, and a clearly named
function to the relevant service.
