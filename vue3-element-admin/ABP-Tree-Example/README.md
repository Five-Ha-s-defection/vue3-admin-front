# ABP框架树形结构联查示例

本项目演示如何使用ABP框架实现两个表联查的树形结构，包含父级ID的完整后端实现。

## 项目结构

```
ABP-Tree-Example/
├── src/
│   ├── YourProject.Domain/           # 领域层
│   │   ├── Entities/                 # 实体
│   │   └── Repositories/             # 仓储接口
│   ├── YourProject.Application/      # 应用层
│   │   ├── DTOs/                     # 数据传输对象
│   │   ├── Services/                 # 应用服务
│   │   └── AutoMapper/               # 对象映射配置
│   └── YourProject.EntityFrameworkCore/  # 数据访问层
│       ├── EntityFrameworkCore/      # EF Core配置
│       └── Repositories/             # 仓储实现
```

## 功能特性

- 两个表的树形结构联查
- 支持无限级父子关系
- 递归查询优化
- 缓存支持
- 完整的CRUD操作

## 技术栈

- ABP Framework 8.x
- Entity Framework Core
- AutoMapper
- .NET 8 