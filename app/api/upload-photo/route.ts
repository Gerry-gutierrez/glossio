import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WebP.' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('work-photos')
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('work-photos')
      .getPublicUrl(uploadData.path)

    // Get current photo count for sort_order
    const { count } = await supabase
      .from('work_photos')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)

    // Insert record into work_photos table
    const { data: photoRecord, error: dbError } = await supabase
      .from('work_photos')
      .insert({
        profile_id: user.id,
        url: urlData.publicUrl,
        sort_order: (count || 0) + 1,
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB error:', dbError)
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from('work-photos').remove([uploadData.path])
      return NextResponse.json({ error: 'Failed to save photo record' }, { status: 500 })
    }

    return NextResponse.json({ photo: photoRecord })
  } catch (err) {
    console.error('Upload handler error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { photoIds } = await request.json()
    if (!photoIds || !Array.isArray(photoIds)) {
      return NextResponse.json({ error: 'No photo IDs provided' }, { status: 400 })
    }

    // Get photo records to find storage paths
    const { data: photos } = await supabase
      .from('work_photos')
      .select('id, url')
      .in('id', photoIds)
      .eq('profile_id', user.id)

    if (photos && photos.length > 0) {
      // Extract storage paths from URLs
      const storagePaths = photos
        .map(p => {
          const match = p.url.match(/work-photos\/(.+)$/)
          return match ? match[1] : null
        })
        .filter(Boolean) as string[]

      // Delete from storage
      if (storagePaths.length > 0) {
        await supabase.storage.from('work-photos').remove(storagePaths)
      }

      // Delete from database
      await supabase
        .from('work_photos')
        .delete()
        .in('id', photoIds)
        .eq('profile_id', user.id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete handler error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
