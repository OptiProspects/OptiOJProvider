import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tag, TagCategoryDetail, getTagCategoryTree } from "@/lib/tagService"
import { cn } from "@/lib/utils"
import { Filter } from "lucide-react"

interface TagFilterDialogProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  tags: Tag[]
}

export function TagFilterDialog({ selectedTags, onTagsChange, tags }: TagFilterDialogProps) {
  const [categories, setCategories] = React.useState<TagCategoryDetail[]>([])
  const [selectedCategory, setSelectedCategory] = React.useState<number | null>(null)
  const [selectedSubCategory, setSelectedSubCategory] = React.useState<number | null>(null)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getTagCategoryTree()
        if (response.categories) {
          setCategories(response.categories)
        }
      } catch (error) {
        console.error("获取标签分类失败:", error)
      }
    }
    fetchCategories()
  }, [])

  const filteredTags = React.useMemo(() => {
    if (!selectedSubCategory && !selectedCategory) return tags
    return tags.filter(tag => {
      if (selectedSubCategory) {
        return tag.category_id === selectedSubCategory
      }
      if (selectedCategory) {
        const category = categories.find(c => c.id === selectedCategory)
        return category?.children.some(sub => sub.id === tag.category_id)
      }
      return true
    })
  }, [tags, selectedCategory, selectedSubCategory, categories])

  const handleTagClick = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId))
    } else {
      onTagsChange([...selectedTags, tagId])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          标签筛选
          {selectedTags.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {selectedTags.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>标签筛选</DialogTitle>
          <DialogDescription>
            选择标签分类和具体标签进行筛选
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-4">
          {/* 一级分类 */}
          <div className="col-span-3 border-r pr-4">
            <div className="font-medium mb-2">一级分类</div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    !selectedCategory && "bg-accent"
                  )}
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedSubCategory(null)
                  }}
                >
                  全部
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      selectedCategory === category.id && "bg-accent"
                    )}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setSelectedSubCategory(null)
                    }}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 二级分类 */}
          <div className="col-span-3 border-r pr-4">
            <div className="font-medium mb-2">二级分类</div>
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    selectedCategory && !selectedSubCategory && "bg-accent"
                  )}
                  onClick={() => setSelectedSubCategory(null)}
                >
                  全部
                </Button>
                {selectedCategory && categories
                  .find(c => c.id === selectedCategory)
                  ?.children.map(subCategory => (
                    <Button
                      key={subCategory.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        selectedSubCategory === subCategory.id && "bg-accent"
                      )}
                      onClick={() => setSelectedSubCategory(subCategory.id)}
                    >
                      {subCategory.name}
                    </Button>
                  ))}
              </div>
            </ScrollArea>
          </div>

          {/* 标签列表 */}
          <div className="col-span-6">
            <div className="font-medium mb-2">标签</div>
            <ScrollArea className="h-[300px]">
              <div className="flex flex-wrap gap-2">
                {filteredTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(String(tag.id)) ? "default" : "outline"}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedTags.includes(String(tag.id)) ? tag.color : 'transparent',
                      borderColor: tag.color,
                      color: selectedTags.includes(String(tag.id)) ? '#fff' : undefined
                    }}
                    onClick={() => handleTagClick(String(tag.id))}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {filteredTags.length === 0 && (
                  <div className="text-muted-foreground text-sm">暂无标签</div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              onTagsChange([])
              setSelectedCategory(null)
              setSelectedSubCategory(null)
            }}
          >
            重置
          </Button>
          <Button onClick={() => setOpen(false)}>
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 